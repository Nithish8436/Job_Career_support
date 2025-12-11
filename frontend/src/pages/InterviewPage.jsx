import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Mic, Play, Square, Loader2, ArrowLeft, CheckCircle, ArrowRight, Briefcase, Users, Code, Server, Database, Cloud, Smartphone, Layers, FileText, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { awardXP } from '../lib/progressHelper';

const InterviewPage = () => {
    const [mode, setMode] = useState(null); // 'technical' or 'hr'
    const [domain, setDomain] = useState(null); // For technical interviews: 'frontend', 'backend', etc.
    const [useResume, setUseResume] = useState(false); // Whether to use resume-based questions
    const [selectedResume, setSelectedResume] = useState(null); // Selected resume for questions
    const [userResumes, setUserResumes] = useState([]); // User's uploaded resumes
    const [uploadingResume, setUploadingResume] = useState(false); // Resume upload in progress
    const [resumeFile, setResumeFile] = useState(null); // File to upload
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [finished, setFinished] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const { token, user } = useAuth();

    // Fetch user's resumes on component mount
    useEffect(() => {
        const fetchResumes = async () => {
            if (!user) return;
            try {
                const response = await fetch(`http://localhost:5000/api/match/user/${user.id}`);
                const data = await response.json();
                if (data.success && data.matches) {
                    setUserResumes(data.matches);
                }
            } catch (error) {
                console.error('Error fetching resumes:', error);
            }
        };
        fetchResumes();
    }, [user]);

    const speakQuestion = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                setIsSpeaking(false);
                startCountdown();
            };
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const startCountdown = () => {
        setCountdown(3);
        let count = 3;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                setCountdown(null);
                SpeechRecognition.startListening({
                    continuous: true,
                    interimResults: true,
                    language: 'en-US'
                });
            }
        }, 1000);
    };

    const generateQuestions = async (interviewMode, selectedDomain = null, resumeData = null) => {
        setLoading(true);
        try {
            let prompt;
            if (interviewMode === 'technical' && resumeData) {
                // Resume-based questions
                const resumeContext = `Resume Summary: ${resumeData.resumeText?.substring(0, 1000) || 'N/A'}\nJob Title: ${resumeData.jobTitle || 'N/A'}\nSkills Mentioned: ${resumeData.skills?.join(', ') || 'N/A'}`;
                prompt = `Generate exactly 5 technical interview questions personalized to this candidate's resume. 

Resume Context:
${resumeContext}

Requirements:
- Questions should match their experience level and technologies
- Mix of conceptual, practical, and problem-solving questions
- Appropriate difficulty for their background

CRITICAL: Return ONLY a valid JSON array with exactly 5 questions. No markdown, no explanations, no code blocks. Just the array.

Example format:
["What is your experience with React hooks and when would you use useMemo?", "How would you optimize a slow database query?", "Explain the difference between REST and GraphQL APIs.", "Describe how you would implement authentication in a web application.", "What is your approach to debugging production issues?"]`;
            } else if (interviewMode === 'technical' && selectedDomain) {
                const domainPrompts = {
                    frontend: 'Frontend Developer - HTML, CSS, JavaScript, React, Vue, Angular, responsive design, web performance, browser APIs, accessibility',
                    backend: 'Backend Developer - server-side programming, databases (SQL/NoSQL), APIs, authentication, scalability, microservices, caching',
                    fullstack: 'Full Stack Developer - both frontend and backend technologies, system architecture, database design, end-to-end development, DevOps basics',
                    datascience: 'Data Science - machine learning, statistics, data analysis, Python, R, data visualization, model deployment, feature engineering',
                    devops: 'DevOps Engineer - CI/CD pipelines, containerization (Docker/Kubernetes), cloud platforms (AWS/Azure/GCP), infrastructure as code, monitoring, automation',
                    mobile: 'Mobile Developer - iOS/Android development, mobile UI/UX patterns, performance optimization, native vs hybrid apps, mobile-specific challenges'
                };
                prompt = `Generate exactly 5 technical interview questions for a ${domainPrompts[selectedDomain]} role.

Requirements:
- Mix of conceptual understanding, practical application, and problem-solving
- Appropriate for mid-level candidates
- Cover key technologies and concepts in this domain

CRITICAL: Return ONLY a valid JSON array with exactly 5 questions. No markdown, no explanations, no code blocks. Just the array.

Example format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;
            } else if (interviewMode === 'technical') {
                prompt = `Generate exactly 5 technical interview questions for a software developer role.

Focus areas:
- Programming fundamentals (algorithms, data structures)
- System design concepts
- Problem-solving approaches
- Best practices and patterns

CRITICAL: Return ONLY a valid JSON array with exactly 5 questions. No markdown, no explanations, no code blocks. Just the array.

Example format:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`;
            } else {
                prompt = `Generate exactly 5 HR/behavioral interview questions.

Focus areas:
- Teamwork and collaboration
- Conflict resolution
- Leadership and initiative
- Work ethic and time management
- Career goals and motivation
- Handling pressure and challenges

CRITICAL: Return ONLY a valid JSON array with exactly 5 questions. No markdown, no explanations, no code blocks. Just the array.

Example format:
["Tell me about a time when you had to work with a difficult team member. How did you handle it?", "Describe a challenging project you worked on. What obstacles did you face?", "What are your greatest strengths and how do they apply to this role?", "Tell me about a time you had to learn something new quickly.", "Where do you see yourself in 5 years?"]`;
            }

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    message: prompt,
                    history: []
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.message) {
                // Try to extract JSON array from response
                let parsed = null;
                
                // First try direct JSON parse
                try {
                    parsed = JSON.parse(data.message);
                    if (Array.isArray(parsed)) {
                        setQuestions(parsed);
                        setLoading(false);
                        return parsed;
                    }
                } catch (e) {
                    // Not direct JSON, try to extract array
                }
                
                // Try to find JSON array in the response
                const jsonMatch = data.message.match(/\[[\s\S]*?\]/);
                if (jsonMatch) {
                    try {
                        parsed = JSON.parse(jsonMatch[0]);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setQuestions(parsed);
                            setLoading(false);
                            return parsed;
                        }
                    } catch (e) {
                        console.error('Failed to parse JSON from response:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating questions:', error);
        }

        // Fallback questions
        const fallbackQuestions = interviewMode === 'technical'
            ? [
                "Explain the difference between let, const, and var in JavaScript.",
                "What is the time complexity of binary search and why?",
                "Describe how you would design a URL shortening service like bit.ly.",
                "What are the key differences between SQL and NoSQL databases?",
                "Explain the concept of closures in JavaScript with an example."
            ]
            : [
                "Tell me about yourself and your background.",
                "Describe a time when you had to work with a difficult team member.",
                "What are your greatest strengths and how do they apply to this role?",
                "Tell me about a challenging project you worked on and how you overcame obstacles.",
                "Where do you see yourself in 5 years?"
            ];

        setQuestions(fallbackQuestions);
        setLoading(false);
        return fallbackQuestions;
    };

    const startInterview = async () => {
        const resumeData = useResume && selectedResume ? selectedResume : null;
        const generatedQuestions = await generateQuestions(mode, domain, resumeData);

        setStarted(true);
        setCurrentQuestionIndex(0);
        const firstQuestion = generatedQuestions[0];
        setCurrentQuestion(firstQuestion);
        resetTranscript();
        setTimeout(() => speakQuestion(firstQuestion), 500);
    };

    const submitAnswer = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        }

        const newAnswers = [...answers, {
            question: currentQuestion,
            answer: transcript
        }];
        setAnswers(newAnswers);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            const nextQ = questions[nextIndex];
            setCurrentQuestion(nextQ);
            resetTranscript();
            setTimeout(() => speakQuestion(nextQ), 500);
        } else {
            getFinalFeedback(newAnswers);
        }
    };

    const generateFallbackFeedback = (allAnswers, interviewMode) => {
        const totalQuestions = allAnswers.length;
        const avgAnswerLength = allAnswers.reduce((sum, qa) => sum + (qa.answer?.length || 0), 0) / totalQuestions;
        
        return `## Overall Score: ${avgAnswerLength > 50 ? '7' : '6'}/10

## 💪 ${interviewMode === 'technical' ? 'Technical ' : ''}Strengths

- Completed all ${totalQuestions} interview questions
- ${avgAnswerLength > 50 ? 'Provided detailed answers' : 'Attempted to answer all questions'}
- Demonstrated willingness to engage with the interview process

## 🎯 Areas for Improvement

- ${avgAnswerLength < 50 ? 'Provide more detailed answers with specific examples' : 'Consider adding more technical depth to responses'}
- Practice structuring answers more clearly
- Include concrete examples from past experience

## 📝 Question-by-Question Summary

${allAnswers.map((qa, idx) => `### Question ${idx + 1}: ${qa.question}
**Your Answer:** ${qa.answer || 'No answer provided'}
**Length:** ${qa.answer?.length || 0} characters
`).join('\n')}

## ✅ Action Items

1. **Practice answering questions out loud** - This helps improve clarity and confidence
2. **Prepare specific examples** - Have 3-5 concrete examples ready for behavioral questions
3. **Study technical fundamentals** - Review core concepts relevant to your field
4. **Record yourself** - Practice speaking clearly and at a moderate pace

*Note: This is a basic feedback summary. For detailed AI-powered feedback, please try again.*`;
    };

    const getFinalFeedback = async (allAnswers) => {
        setLoading(true);
        setFinished(true);

        try {
            const interviewSummary = allAnswers.map((qa, idx) =>
                `**Q${idx + 1}:** ${qa.question}\n**A${idx + 1}:** ${qa.answer}`
            ).join('\n\n');

            const feedbackPrompt = mode === 'technical'
                ? `You are an expert technical interviewer providing detailed, constructive feedback. 

I just completed a TECHNICAL mock interview. Here are all my questions and answers:

${interviewSummary}

Please provide comprehensive, accurate technical feedback. Be specific about:
- Technical accuracy of answers
- Depth of knowledge demonstrated
- Areas where answers were incomplete or incorrect
- What the candidate did well technically
- Specific technical concepts they should study

Use proper markdown formatting:

## Overall Score: [X]/10

Provide a score from 1-10 based on technical accuracy, depth, and clarity.

## 💪 Technical Strengths

List 3-5 specific technical strengths demonstrated in the answers. Be concrete:
- "Demonstrated solid understanding of [concept] by explaining [specific detail]"
- "Correctly identified [technical point] and provided accurate explanation"

## 🎯 Areas for Technical Improvement

List 3-5 specific areas needing improvement with actionable details:
- "Incorrect explanation of [concept]. The correct answer is [explanation]"
- "Missing key point about [topic]. Should have mentioned [specific detail]"
- "Could deepen understanding of [concept] by studying [specific resources/topics]"

## 📝 Question-by-Question Feedback

For each question, provide:
### Question [N]: [Question text]
**Answer Given:** [Brief summary of what was said]
**Feedback:** 
- ✅ What was correct/good
- ❌ What was incorrect or missing
- 💡 What should have been included
- 📚 Recommended study topics

## ✅ Action Items

Provide 3-5 specific, actionable steps:
1. **[Specific action]** - [Why this helps technically] - [Resources to use]
2. **[Specific action]** - [Why this helps technically] - [Resources to use]
3. **[Specific action]** - [Why this helps technically] - [Resources to use]

Be honest, constructive, and specific. Focus on technical accuracy and depth.`
                : `You are an expert HR interviewer providing detailed, constructive behavioral feedback.

I just completed an HR/BEHAVIORAL mock interview. Here are all my questions and answers:

${interviewSummary}

Please provide comprehensive, accurate behavioral feedback. Be specific about:
- Use of STAR method (Situation, Task, Action, Result)
- Clarity and structure of responses
- Examples provided and their relevance
- Communication skills demonstrated
- Areas where answers were vague or incomplete

Use proper markdown formatting:

## Overall Score: [X]/10

Provide a score from 1-10 based on answer structure, clarity, relevance, and use of examples.

## 💪 Strengths

List 3-5 specific behavioral strengths demonstrated:
- "Effectively used STAR method in [specific question] by clearly describing [situation]"
- "Demonstrated strong [skill] by providing concrete example of [specific instance]"
- "Showed good self-awareness by acknowledging [specific point]"

## 🎯 Areas for Improvement

List 3-5 specific areas needing improvement with actionable details:
- "Answer lacked structure. Should use STAR method: Situation was [missing], Task was [missing]..."
- "Example was too vague. Should have included specific metrics like [what was missing]"
- "Didn't clearly connect experience to question. Should have emphasized [specific connection]"

## 📝 Question-by-Question Feedback

For each question, provide:
### Question [N]: [Question text]
**Answer Given:** [Brief summary]
**Feedback:**
- ✅ What was effective (structure, clarity, examples)
- ❌ What was missing or could be improved
- 💡 How to strengthen this answer
- 📝 Suggested improved answer structure

## ✅ Action Items

Provide 3-5 specific, actionable steps:
1. **[Specific action]** - [Why this helps] - [How to practice]
2. **[Specific action]** - [Why this helps] - [How to practice]
3. **[Specific action]** - [Why this helps] - [How to practice]

Be honest, constructive, and specific. Focus on answer structure, clarity, and use of concrete examples.`;

            try {
                const response = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        message: feedbackPrompt,
                        history: []
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success && data.message) {
                    setFinalFeedback(data.message);
                } else {
                    throw new Error(data.error || data.details || 'Failed to get feedback');
                }
            } catch (fetchError) {
                console.error('Feedback fetch error:', fetchError);
                // Generate a basic fallback feedback
                const fallbackFeedback = generateFallbackFeedback(allAnswers, mode);
                setFinalFeedback(fallbackFeedback);
            }

            // Award XP for interview completion
            await awardXP('interview_complete', {}, token);
        } catch (error) {
            console.error('Error getting feedback:', error);
            setFinalFeedback(`## Great Job! 🎉\n\nYou completed the ${mode} interview! Unfortunately, I couldn't connect to get detailed feedback, but you showed great effort in answering all questions.`);

            // Still award XP even if feedback fails
            await awardXP('interview_complete', {}, token);
        } finally {
            setLoading(false);
        }
    };

    const handleListen = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            SpeechRecognition.startListening({
                continuous: true,
                interimResults: true,
                language: 'en-US'
            });
        }
    };

    const handleRestart = () => {
        setMode(null);
        setDomain(null);
        setUseResume(false);
        setSelectedResume(null);
        setResumeFile(null);
        setUploadingResume(false);
        setStarted(false);
        setCurrentQuestionIndex(0);
        setQuestions([]);
        setAnswers([]);
        setFinalFeedback(null);
        setFinished(false);
        resetTranscript();
    };

    const handleResumeUpload = async () => {
        if (!resumeFile || !user) return;

        setUploadingResume(true);
        try {
            // Upload resume
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('userId', user.id);

            const uploadResponse = await fetch('http://localhost:5000/api/upload/resume', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload resume');
            }

            const uploadData = await uploadResponse.json();

            // Fetch the uploaded resume details
            const response = await fetch(`http://localhost:5000/api/match/user/${user.id}`);
            const data = await response.json();
            if (data.success && data.matches) {
                setUserResumes(data.matches);
                // Select the most recently uploaded resume
                const latestResume = data.matches[0];
                setSelectedResume(latestResume);
                setUseResume(true);
                setResumeFile(null); // Clear the file input
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            alert('Failed to upload resume. Please try again.');
        } finally {
            setUploadingResume(false);
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-6 text-center">
                        <p>Browser doesn't support speech recognition. Please use Chrome.</p>
                        <Link to="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mode Selection Screen
    if (!mode) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="font-bold text-lg">AI Mock Interview</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-4xl w-full">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Choose Interview Type</h2>
                            <p className="text-muted text-lg">Select the type of interview you want to practice</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Technical Interview */}
                            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary group" onClick={() => setMode('technical')}>
                                <CardContent className="p-8 text-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                                        <Briefcase className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Technical Interview</h3>
                                    <p className="text-muted mb-6">
                                        Practice coding, algorithms, system design, and technical problem-solving questions
                                    </p>
                                    <ul className="text-sm text-left space-y-2 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Choose your domain specialization
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Domain-specific questions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Programming fundamentals
                                        </li>
                                    </ul>
                                    <Button className="w-full">Start Technical Interview</Button>
                                </CardContent>
                            </Card>

                            {/* HR Interview */}
                            <Card className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary group" onClick={() => setMode('hr')}>
                                <CardContent className="p-8 text-center">
                                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors">
                                        <Users className="w-10 h-10 text-purple-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">HR Interview</h3>
                                    <p className="text-muted mb-6">
                                        Practice behavioral questions, teamwork scenarios, and soft skills assessment
                                    </p>
                                    <ul className="text-sm text-left space-y-2 mb-6">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Behavioral questions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Teamwork & leadership
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            Career goals & motivation
                                        </li>
                                    </ul>
                                    <Button className="w-full">Start HR Interview</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Domain Selection Screen (for Technical Interviews)
    if (mode === 'technical' && !domain && !useResume) {
        const domains = [
            { id: 'frontend', name: 'Frontend Development', icon: Code, color: 'blue', description: 'HTML, CSS, JavaScript, React, Vue' },
            { id: 'backend', name: 'Backend Development', icon: Server, color: 'green', description: 'APIs, Databases, Server-side logic' },
            { id: 'fullstack', name: 'Full Stack Development', icon: Layers, color: 'purple', description: 'Frontend + Backend + Architecture' },
            { id: 'datascience', name: 'Data Science', icon: Database, color: 'pink', description: 'ML, Statistics, Data Analysis' },
            { id: 'devops', name: 'DevOps Engineering', icon: Cloud, color: 'orange', description: 'CI/CD, Cloud, Infrastructure' },
            { id: 'mobile', name: 'Mobile Development', icon: Smartphone, color: 'indigo', description: 'iOS, Android, Mobile UI/UX' }
        ];

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => setMode(null)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold text-lg">Select Your Domain</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-6xl w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-4">Choose Your Technical Domain</h2>
                            <p className="text-muted text-lg">Select your area of expertise for tailored interview questions</p>
                        </div>

                        {/* Resume-Based Option */}
                        <div className="mb-8">
                            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-50">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-2">Resume-Based Interview</h3>
                                            <p className="text-sm text-muted mb-4">
                                                Get personalized questions based on your uploaded resume and experience
                                            </p>


                                            {/* Upload Resume */}
                                            <div className="flex gap-3 items-end">
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                                        Upload your resume (PDF or DOCX):
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.docx"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setResumeFile(e.target.files[0]);
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                    {resumeFile && (
                                                        <p className="text-xs text-muted mt-1">
                                                            Selected: {resumeFile.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={handleResumeUpload}
                                                    disabled={!resumeFile || uploadingResume}
                                                    className="whitespace-nowrap"
                                                >
                                                    {uploadingResume ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Start Interview
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="text-center my-6">
                                <span className="text-muted text-sm">OR</span>
                            </div>
                        </div>

                        {/* Domain Options */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-center">Choose a Domain</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {domains.map((domain) => {
                                    const Icon = domain.icon;
                                    const colorClasses = {
                                        blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200',
                                        green: 'bg-green-100 text-green-600 group-hover:bg-green-200',
                                        purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-200',
                                        pink: 'bg-pink-100 text-pink-600 group-hover:bg-pink-200',
                                        orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-200',
                                        indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                                    };

                                    return (
                                        <Card
                                            key={domain.id}
                                            className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary group"
                                            onClick={() => setDomain(domain.id)}
                                        >
                                            <CardContent className="p-6 text-center">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${colorClasses[domain.color]}`}>
                                                    <Icon className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold mb-2">{domain.name}</h3>
                                                <p className="text-sm text-muted">{domain.description}</p>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={handleRestart}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold text-lg">Interview Complete!</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <div className="flex-1 max-w-3xl w-full mx-auto p-4 py-8">
                    {loading ? (
                        <Card className="p-12 text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-lg text-muted">Analyzing your {mode} interview performance...</p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <Card className="bg-gradient-to-br from-primary to-purple-600 text-white border-none shadow-xl">
                                <CardContent className="p-8 text-center">
                                    <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold mb-2">{mode === 'technical' ? 'Technical' : 'HR'} Interview Complete!</h2>
                                    <p className="text-white/90">You answered all {questions.length} questions. Here's your feedback:</p>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <CheckCircle className="w-6 h-6 text-primary" />
                                        Your Interview Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                                        <ReactMarkdown>{finalFeedback}</ReactMarkdown>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-4">
                                <Link to="/dashboard" className="flex-1">
                                    <Button variant="outline" className="w-full">Back to Dashboard</Button>
                                </Link>
                                <Button className="flex-1" onClick={handleRestart}>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleRestart}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="font-bold text-lg text-text">
                            {mode === 'technical' ? 'Technical' : 'HR'} Interview
                        </h1>
                    </div>
                    {started && (
                        <div className="w-full max-w-xs">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col justify-center">
                {!started ? (
                    <Card className="text-center p-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                            <Mic className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Ready for your {mode} interview?</h2>
                        <p className="text-muted mb-8">
                            I'll ask you {mode} questions with AI voice narration. Answer each one, and you'll receive comprehensive feedback at the end.
                        </p>
                        <Button size="lg" onClick={startInterview} disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Start Interview <Play className="ml-2 w-4 h-4" />
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="border-primary/20 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-primary text-xl">Interview Question</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xl font-medium text-text leading-relaxed">{currentQuestion}</p>
                            </CardContent>
                        </Card>

                        <div className="relative">
                            <Card className={cn(
                                "min-h-[250px] transition-all duration-300",
                                listening ? "border-primary ring-2 ring-primary/20 shadow-lg" : "",
                                countdown !== null ? "bg-gradient-to-br from-primary/5 to-purple-50" : ""
                            )}>
                                <CardContent className="p-6 min-h-[250px] flex items-center justify-center">
                                    {countdown !== null ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-7xl font-bold text-primary mb-4 animate-pulse">{countdown}</div>
                                            <p className="text-lg text-muted font-medium">Get ready to answer...</p>
                                        </div>
                                    ) : transcript ? (
                                        <div className="w-full">
                                            <p className="text-lg text-gray-700 leading-relaxed">{transcript}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted italic text-center">
                                            {listening ? (
                                                <span className="flex items-center gap-2 text-primary font-medium">
                                                    <Mic className="w-5 h-5 animate-pulse" />
                                                    Listening... Start speaking!
                                                </span>
                                            ) : (
                                                "Tap the microphone to start speaking..."
                                            )}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <Button
                                    variant={listening ? "destructive" : "default"}
                                    size="icon"
                                    className="rounded-full w-14 h-14 shadow-xl"
                                    onClick={handleListen}
                                    disabled={countdown !== null}
                                >
                                    {listening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                </Button>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            onClick={submitAnswer}
                            disabled={!transcript || listening || countdown !== null}
                            size="lg"
                        >
                            {currentQuestionIndex < questions.length - 1 ? (
                                <>Next Question <ArrowRight className="ml-2 w-5 h-5" /></>
                            ) : (
                                <>Finish Interview <CheckCircle className="ml-2 w-5 h-5" /></>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPage;
