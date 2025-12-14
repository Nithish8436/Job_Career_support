const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function writeParseErrorLog(raw) {
    try {
        const logLine = `\n[${new Date().toISOString()}] AI JSON parse failed. Preview:\n${raw.substring(0, 800)}\n`;
        fs.appendFileSync('ai_parse_errors.log', logLine);
    } catch (err) {
        console.error('Failed to write ai_parse_errors.log:', err.message);
    }
}

// Helper to clean JSON output from Markdown
function cleanJsonOutput(content) {
    if (typeof content !== 'string') return content;

    // Normalize fancy quotes and strip null/control chars
    content = content
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u0000-\u001F]+/g, ' ');

    // Remove markdown code blocks if present
    content = content.replace(/```json\s*([\s\S]*?)\s*```/g, '$1');
    content = content.replace(/```\s*([\s\S]*?)\s*```/g, '$1');

    // Attempt to find the first '{' and last '}'
    const firstOpen = content.indexOf('{');
    const lastClose = content.lastIndexOf('}');

    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        content = content.substring(firstOpen, lastClose + 1);
    }

    // Replace single quotes around keys/strings (common AI slip) with double quotes
    content = content.replace(/([{,\s])'([^']*)'\s*:/g, '$1"$2":');
    content = content.replace(/:\s*'([^']*)'/g, ':"$1"');

    // Remove trailing commas before closing braces/brackets
    content = content.replace(/,\s*([}\]])/g, '$1');

    return content.trim();
}

function tryParseJson(content) {
    if (typeof content === 'object') return content;

    console.log('[tryParseJson] Attempting to parse JSON. Content length:', content.length);
    console.log('[tryParseJson] Content preview (first 300 chars):', content.substring(0, 300));
    if (content.length > 600) {
        console.log('[tryParseJson] Content preview (last 300 chars):', content.substring(content.length - 300));
    }

    // Attempt direct parse
    try {
        const parsed = JSON.parse(content);
        console.log('[tryParseJson] ✓ Direct parse succeeded');
        return parsed;
    } catch (e) {
        console.log('[tryParseJson] Direct parse failed:', e.message);
    }

    // Clean and retry
    try {
        const cleaned = cleanJsonOutput(content);
        console.log('[tryParseJson] Cleaned content preview (first 300 chars):', cleaned.substring(0, 300));
        const parsed = JSON.parse(cleaned);
        console.log('[tryParseJson] ✓ Cleaned parse succeeded');
        return parsed;
    } catch (e) {
        console.log('[tryParseJson] Cleaned parse failed:', e.message);
    }

    // Find the deepest/most complete JSON object (handles cases where AI includes resume text before JSON)
    // This finds the longest valid JSON object by matching braces
    let bestMatch = null;
    let bestLength = 0;

    for (let i = 0; i < content.length; i++) {
        if (content[i] === '{') {
            let depth = 0;
            let start = i;
            for (let j = i; j < content.length; j++) {
                if (content[j] === '{') depth++;
                if (content[j] === '}') {
                    depth--;
                    if (depth === 0) {
                        // Found a complete JSON object
                        const candidate = content.substring(start, j + 1);
                        try {
                            JSON.parse(candidate);
                            if (candidate.length > bestLength) {
                                bestMatch = candidate;
                                bestLength = candidate.length;
                            }
                        } catch (e) {
                            // Not valid JSON, continue searching
                        }
                        break;
                    }
                }
            }
        }
    }

    if (bestMatch) {
        console.log('[tryParseJson] ✓ Found valid JSON segment (length:', bestMatch.length, ')');
        try {
            return JSON.parse(bestMatch);
        } catch (e) {
            console.log('[tryParseJson] Best match parse failed:', e.message);
        }
    }

    // Last-resort: extract from first '{' to last '}'
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        const candidate = content.substring(start, end + 1);
        console.log('[tryParseJson] Trying fallback extraction (length:', candidate.length, ')');
        try {
            const parsed = JSON.parse(candidate);
            console.log('[tryParseJson] ✓ Fallback parse succeeded');
            return parsed;
        } catch (e) {
            console.log('[tryParseJson] Fallback parse failed:', e.message);
        }
    }

    console.error('[tryParseJson] ✗ All parsing attempts failed');
    writeParseErrorLog(content);
    throw new Error('Failed to parse AI response as JSON');
}



async function callGroqAI(messages, jsonMode = true, useResponseFormat = true) {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is missing in .env');
    }

    try {
        // Log request details for debugging
        const maskedKey = GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : 'undefined';
        console.log(`[Groq] Using API Key: ${maskedKey}`);
        console.log(
            `[Groq] Sending request. Model: llama-3.3-70b-versatile. Messages: ${messages.length}. Content Length: ${messages[1]?.content?.length || 0}`
        );

        // JSON mode disabled because strict json_object can cause failed_generation on Llama 3
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.1, // lower temp for more accurate output
                response_format:
                    jsonMode && useResponseFormat
                        ? { type: 'json_object' }
                        : undefined
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (
            !response.data ||
            !response.data.choices ||
            response.data.choices.length === 0
        ) {
            console.error('Groq Empty Response:', JSON.stringify(response.data));
            throw new Error('Empty response from AI service');
        }

        let rawContent = response.data.choices[0]?.message?.content;

        // Groq sometimes returns content as an array of chunks → flatten to string
        if (Array.isArray(rawContent)) {
            rawContent = rawContent
                .map(part => part?.text ?? '')
                .join('')
                .trim();
        }

        const content =
            (typeof rawContent === 'string'
                ? rawContent
                : JSON.stringify(rawContent || '')
            ).trim();

        console.log(
            'aiService.js Content----------------------------------------------:',
            content
        );

        // Debug truncated view if large
        if (content.length > 1000) {
            console.log('[Groq] Raw AI Response (first 500 chars):', content.substring(0, 500) + '...');
            console.log('[Groq] Raw AI Response (last 500 chars):', '...' + content.substring(content.length - 500));
        } else {
            console.log('[Groq] Raw AI Response (full):', content);
        }

        if (jsonMode) {
            return tryParseJson(content);
        }

        return content;

    } catch (error) {
        const errMsg =
            error.response?.data?.error?.message ||
            error.message ||
            '';

        console.error(' Error Details:', error.response?.data || error.message);

        // Retry once without json_object formatting if model fails strict mode
        if (
            jsonMode &&
            useResponseFormat &&
            errMsg.toLowerCase().includes('failed_generation')
        ) {
            console.warn(
                'Groq failed_generation with response_format. Retrying without response_format...'
            );
            return callGroqAI(messages, jsonMode, false);
        }

        throw new Error(`AI Service Error: ${errMsg || 'Unknown error'}`);
    }
}


async function extractResumeText(buffer, extname) {
    try {
        if (extname === '.pdf') {
            const data = await pdf(buffer);
            console.log('PDF Text----------------------------------------------:', data.text);
            return data.text;
        } else if (extname === '.docx') {
            const result = await mammoth.extractRawText({ buffer: buffer });
            return result.value;
        } else {
            throw new Error('Unsupported file extension');
        }
    } catch (error) {
        console.error('Text extraction failed:', error);
        throw new Error('Failed to extract text from file');
    }
}

async function analyzeMatch(resumeText, jobDescription) {
    const systemPrompt = `You are a strict and critical ATS (Applicant Tracking System) & Technical Recruiter.
    Analyze the resume against the job description with high skepticism.
    
    SCORING RUBRIC:
    - 90-100%: Perfect match. All skills, years of experience, and exact keywords found. Quantifiable achievements present.
    - 75-89%: Strong match. Most critical skills found. Good experience alignment. Minor gaps allowed.
    - 50-74%: Partial match. Some key skills missing or experience is too junior/unrelated.
    - 0-49%: Poor match. Major skills missing, irrelevant experience, or bad formatting.

    CRITICAL INSTRUCTIONS:
    1. Do NOT hallucinate skills. If a skill is not explicitly written, it is MISSING.
    2. Penalize vague statements (e.g., "fast learner") vs hard technical proof.
    3. If the candidate has < 50% of required keywords, the score MUST be below 60.
    4. Be harsh on formatting if it's messy or unstructured.

    Return a STRICT JSON object with this EXACT structure:
    {
        "jobTitle": "Extracted Job Title",
        "overallScore": 0,
        "breakdown": {
            "skillsScore": 0,
            "experienceScore": 0,
            "educationScore": 0,
            "formattingScore": 0
        },
        "matchedSkills": ["Skill1", "Skill2"],
        "missingSkills": ["Skill3", "Skill4"],
        "skillAnalysis": {
            "hardSkills": { "matched": [], "missing": [], "improvements": "Specific advice" },
            "softSkills": { "matched": [], "missing": [], "improvements": "Specific advice" },
            "technicalSkills": { "matched": [], "missing": [], "improvements": "Specific advice" }
        },
        "suggestions": [
            { 
                "original": "Original text", 
                "suggested": "Better text", 
                "priority": "high", 
                "reason": "Explanation" 
            }
        ],
        "eligibility": {
            "eligible": true,
            "reason": "Detailed reason why"
        },
        "githubAnalysis": null
    }
    IMPORTANT: Return ONLY valid JSON. No markdown, no explanations.`;

    const userPrompt = `
    RESUME:
    ${resumeText.substring(0, 5000)} ... (truncated if too long)

    JOB DESCRIPTION:
    ${jobDescription}
    `;

    return await callGroqAI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ], true);
}

async function generateCareerSuggestions(matchedSkills, resumeText) {
    const systemPrompt = `You are a Career Counsellor. Suggest 3-5 career paths based on the user's skills and resume.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object. No markdown, no explanations, no resume text.
2. Do NOT include any resume content in your response.
3. Do NOT include any text before or after the JSON.
4. The response must start with { and end with }.

Required JSON structure:
{
    "suggestions": [
        { 
            "title": "Role Title", 
            "description": "Why this fits", 
            "requiredSkills": ["Skill1", "Skill2"],
            "matchScore": 85,
            "roadmap": ["Step 1", "Step 2"] 
        }
    ]
}

Return ONLY the JSON object, nothing else.`;

    const userPrompt = `Based on these skills and resume context, suggest 3-5 career paths:

Skills: ${matchedSkills.join(', ')}

Resume Summary: ${resumeText.substring(0, 1500)}

Return ONLY a JSON object with the structure specified. Do not include any resume text in your response.`;

    try {
        const result = await callGroqAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], true, false); // Don't use response_format to avoid issues

        console.log('[Career Suggestions] Raw result type:', typeof result);
        console.log('[Career Suggestions] Raw result:', JSON.stringify(result).substring(0, 500));

        // Handle potential wrapper difference if model output varies
        let suggestions = [];

        if (Array.isArray(result)) {
            suggestions = result;
        } else if (result && Array.isArray(result.suggestions)) {
            suggestions = result.suggestions;
        } else if (result && typeof result === 'object') {
            // Try to find suggestions array in the object
            const keys = Object.keys(result);
            for (const key of keys) {
                if (Array.isArray(result[key])) {
                    suggestions = result[key];
                    break;
                }
            }
        }

        // Ensure we have valid suggestions with required fields
        const validSuggestions = suggestions
            .filter(item => item && item.title)
            .map(item => ({
                title: item.title || 'Career Path',
                description: item.description || item.whyThisFits || 'A great career path based on your skills',
                requiredSkills: Array.isArray(item.requiredSkills) ? item.requiredSkills :
                    Array.isArray(item.roadmap) ? item.roadmap.slice(0, 3) : [],
                matchScore: typeof item.matchScore === 'number' ? item.matchScore :
                    typeof item.matchPercent === 'number' ? item.matchPercent : 75,
                imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent((item.title || 'technology career') + ' professional workspace')}?width=800&height=400&nologo=true`
            }))
            .slice(0, 5); // Limit to 5 suggestions

        console.log('[Career Suggestions] Processed', validSuggestions.length, 'suggestions');
        return validSuggestions;
    } catch (error) {
        console.error('[Career Suggestions] Error:', error);
        // Return empty array on error - don't break the match analysis
        return [];
    }
}

async function generateEnhancedResume(resumeText, jobDescription, analysisResults) {
    const { generateResumeTemplate } = require('../templates/resumeTemplate');

    const systemPrompt = `You are an expert ATS-Friendly Resume Writer. 
    Your task is to extract and structure resume information into a JSON format that will be used with a standardized template.

    CRITICAL REQUIREMENTS:
    1. Extract ALL information from the resume text provided
    2. Enhance content to better match the job description
    3. Emphasize matched skills from the analysis
    4. Maintain professional, ATS-friendly language
    5. Return ONLY valid JSON, no markdown, no explanations

    Return a JSON object with this EXACT structure:
    {
        "name": "Full Name",
        "contact": {
            "phone": "Phone number",
            "location": "City, State/Country",
            "email": "email@example.com",
            "linkedin": "linkedin.com/in/username",
            "github": "github.com/username",
            "portfolio": "portfolio-url.com"
        },
        "summary": "2-3 sentence professional summary optimized for the job",
        "technicalSkills": {
            "Programming Languages": ["Language1", "Language2"],
            "Web Technologies": ["Tech1", "Tech2"],
            "Databases": ["DB1", "DB2"],
            "UI/UX Design Tools": ["Tool1"],
            "Version Control": ["Git", "GitHub"],
            "Other Categories": ["Item1", "Item2"]
        },
        "softSkills": ["Skill1", "Skill2", "Skill3"],
        "projects": [
            {
                "title": "Project Name",
                "role": "Role/Type (e.g., Web Development)",
                "dates": "Start Date – End Date",
                "technologies": ["Tech1", "Tech2", "Tech3"],
                "description": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
                "link": "GitHub or project URL"
            }
        ],
        "experience": [
            {
                "company": "Company Name",
                "role": "Job Title",
                "location": "City, State or Remote",
                "dates": "Start Date – End Date",
                "responsibilities": ["Responsibility 1", "Responsibility 2"]
            }
        ],
        "education": [
            {
                "degree": "Degree Name",
                "institution": "Institution Name",
                "location": "City, State",
                "dates": "Start Year – End Year",
                "score": "CGPA/Percentage"
            }
        ],
        "certifications": ["Certification 1", "Certification 2"]
    }

    IMPORTANT:
    - Fill ALL fields with data from the resume
    - If a field doesn't exist in the resume, use empty string or empty array
    - Enhance descriptions to match job requirements
    - Use action verbs and quantifiable achievements
    - Keep formatting consistent and professional`;

    const userPrompt = `
    Original Resume Text:
    ${resumeText.substring(0, 5000)}

    Target Job Description:
    ${jobDescription.substring(0, 2000)}

    Match Analysis (use this to emphasize matched skills):
    ${JSON.stringify(analysisResults).substring(0, 1000)}

    Extract and structure the resume data into the JSON format specified above.
    Enhance content to better match the job description while maintaining accuracy.
    Return ONLY the JSON object, nothing else.`;

    try {
        // Get structured data from AI
        const structuredData = await callGroqAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ], true, false); // JSON mode

        console.log('[Enhanced Resume] Structured data received');
        console.log('[Enhanced Resume] Data preview:', JSON.stringify(structuredData).substring(0, 500));

        // Validate and clean the structured data
        const cleanedData = {
            name: structuredData?.name || '',
            contact: structuredData?.contact || {},
            summary: structuredData?.summary || '',
            technicalSkills: structuredData?.technicalSkills || {},
            softSkills: Array.isArray(structuredData?.softSkills) ? structuredData.softSkills : [],
            projects: Array.isArray(structuredData?.projects) ? structuredData.projects : [],
            experience: Array.isArray(structuredData?.experience) ? structuredData.experience : [],
            education: Array.isArray(structuredData?.education) ? structuredData.education : [],
            certifications: Array.isArray(structuredData?.certifications) ? structuredData.certifications : []
        };

        // Use the template to generate HTML
        const htmlCode = generateResumeTemplate(cleanedData);

        console.log('[Enhanced Resume] HTML generated successfully. Length:', htmlCode.length);
        return htmlCode;
    } catch (error) {
        console.error('[Enhanced Resume] Error generating structured data:', error);
        console.error('[Enhanced Resume] Error details:', error.message);

        // Fallback: try to extract basic info from resume text
        const nameMatch = resumeText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
        const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/);

        return generateResumeTemplate({
            name: nameMatch ? nameMatch[1] : 'Your Name',
            contact: {
                phone: phoneMatch ? phoneMatch[1] : '',
                email: emailMatch ? emailMatch[1] : ''
            },
            summary: resumeText.substring(0, 300).replace(/\n/g, ' ').trim(),
            technicalSkills: {},
            softSkills: [],
            projects: [],
            experience: [],
            education: [],
            certifications: []
        });
    }
}

async function chatWithAI(message, history = []) {
    console.log("[ChatWithAI] Received message:", message);

    const cleanMessage = message.trim().toLowerCase();

    const isCasualMessage =
        cleanMessage.length <= 15 ||
        /^(hi|hello|hey|are you there|are you online|ping)$/i.test(cleanMessage);

    /* ---------------- CASUAL MESSAGE: HARD EXIT ---------------- */
    if (isCasualMessage) {
        const messages = [
            {
                role: "system",
                content: `
You are a helpful assistant.
Reply with ONLY ONE short, complete sentence.
Do NOT add sections, bullet points, or labels.
`
            },
            {
                role: "user",
                content: message
            }
        ];

        try {
            const response = await callGroqAI(messages, false, false);
            return response;
        } catch (e) {
            return "Yes, I am here and ready to help you.";
        }
    }

    /* ---------------- JSON REQUEST ---------------- */

    const isJsonRequest =
        message.includes("JSON array") ||
        message.includes('["Question') ||
        message.includes("CRITICAL: Return ONLY a valid JSON array");

    const systemPrompt = isJsonRequest
        ? `
You are an expert Interview Assistant.
Return ONLY a valid JSON array.
No text outside JSON.
`
        : `
You are an AI Career Coach.

Response Rules:
1. Answer strictly in 2-3 short sentences.
2. Be direct and helpful.
3. No headings, no bullet points, no "Key Strengths" sections.
4. Just plain text.
5. IMPORTANT: You CAN accept resume uploads. If asked, say "Yes, please upload your resume using the paperclip icon."
6. Once a resume is uploaded, provide specific feedback based on it.

APP CONTEXT (Your Knowledge Base):
- Project Name: This Career Support Platform
- Resume Analysis: Users can upload a resume and Job Description to get a match score, missing skills, and improvement tips.
- AI Mock Interview: Users can practice technical or behavioral interviews and get AI feedback.
- Career Roadmap: Users get a personalized learning path based on their goals.
- AI Chat: This feature. You assist with career advice, resume tips, and app navigation.
- How to analyze resume: Go to 'Upload' page -> Upload PDF -> Paste Job Description -> Click Analyze.
`;

    /* ---------------- NORMAL FLOW ---------------- */

    const messages = [{ role: "system", content: systemPrompt }];

    if (Array.isArray(history)) {
        history.forEach(msg => {
            if (msg?.role && msg?.content) {
                messages.push(msg);
            }
        });
    }

    messages.push({ role: "user", content: message });

    try {
        return await callGroqAI(messages, isJsonRequest, false);
    } catch (e) {
        console.error("❌ Error in chatWithAI/callGroqAI:", e);
        return `Error: ${e.message}`;
    }
}


async function generateInterviewFeedback(interviewSummary, mode = 'technical') {

    const systemPrompt =
        mode === 'technical'
            ? `You are an expert technical interviewer.

Return feedback in a detailed but concise format. STRICT RULES:

1. MAX OUTPUT: 150 words.
2. NO paragraphs. NO long explanations.
3. ONLY include the following sections:

## Overall Score: [X]/10

**Top Strengths**
- 2 bullet points
- Write exactly 2 complete sentences for each bullet point.

**Top Improvements**
- 2 bullet points
- Write exactly 2 complete sentences for each bullet point.

DO NOT include:
- Per-question summary
- Extra sections
- More than 2 bullets per section`
            : `You are an expert HR interviewer.

Return feedback in a detailed but concise format. STRICT RULES:

1. MAX OUTPUT: 150 words.
2. NO paragraphs. NO long explanations.
3. ONLY include the following sections:

## Overall Score: [X]/10

**Top Strengths**
- 2 bullet points
- Write exactly 2 complete sentences for each bullet point.

**Top Improvements**
- 2 bullet points
- Write exactly 2 complete sentences for each bullet point.

DO NOT include:
- Per-question summary
- Extra sections
- More than 2 bullets per section`;

    const userPrompt = `Here are the Q&A pairs:

${interviewSummary}

Return feedback ONLY in the exact short structure required above.`;


    try {
        const response = await callGroqAI(
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            false,
            false
        );

        const text = typeof response === 'string' ? response : JSON.stringify(response);

        // If the output does NOT match the short format, retry once
        const validFormat = /##\s*Overall Score/i.test(text);

        if (!validFormat || text.length > 200) {
            console.warn('[generateInterviewFeedback] Retrying with stricter short format');

            const retrySystem = systemPrompt + `
IMPORTANT: Output MUST be under 80 words. NO extra text. NO per-question summary.`;

            const retry = await callGroqAI(
                [
                    { role: 'system', content: retrySystem },
                    { role: 'user', content: userPrompt }
                ],
                false,
                false
            );

            return typeof retry === 'string' ? retry : JSON.stringify(retry);
        }

        return text;

    } catch (error) {
        console.error('[generateInterviewFeedback] Error:', error);
        throw error;
    }
}


module.exports = {
    extractResumeText,
    extractDocumentText: extractResumeText,
    analyzeMatch,
    generateCareerSuggestions,
    generateEnhancedResume,
    chatWithAI,
    generateInterviewFeedback
};
