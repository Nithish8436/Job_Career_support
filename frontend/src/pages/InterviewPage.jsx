import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Mic, Play, Square, Loader2, ArrowLeft, CheckCircle, ArrowRight, Briefcase, Users, Code, Server, Database, Cloud, Smartphone, Layers, FileText, Upload, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { awardXP } from '../lib/progressHelper';
import Sidebar from '../components/Sidebar';
import SidebarOverlay from '../components/SidebarOverlay';
import ProfileModal from '../components/ProfileModal';

const InterviewPage = () => {
    const [mode, setMode] = useState(null);
    const [domain, setDomain] = useState(null);
    const [useResume, setUseResume] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [userResumes, setUserResumes] = useState([]);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
    };

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

    useEffect(() => {
        if (!transcript) return;
        console.debug('[Speech] transcript update:', transcript.substring(0, 200));
    }, [transcript]);

    const startCountdown = () => {
        if (listening) {
            setCountdown(null);
            return;
        }

        setCountdown(3);
        let count = 3;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                setCountdown(null);
                if (!listening) {
                    SpeechRecognition.startListening({
                        continuous: true,
                        interimResults: true,
                        language: 'en-US'
                    });
                }
            }
        }, 1000);
    };

    const getRandomFocusAreas = (mode, domain) => {
        const topics = {
            frontend: ['CSS Grid & Flexbox', 'React Hooks', 'Web Performance', 'Accessibility (a11y)', 'State Management', 'DOM Manipulation', 'Browser APIs', 'Testing'],
            backend: ['API Design', 'Database Indexing', 'Authentication & Security', 'Scalability', 'Caching Strategies', 'Node.js Event Loop', 'Microservices'],
            fullstack: ['System Design', 'API Integration', 'Deployment & CI/CD', 'Database Normalization', 'Security Best Practices', 'State Management'],
            datascience: ['Feature Engineering', 'Model Evaluation', 'Overfitting/Underfitting', 'SQL Complex Queries', 'Python/Pandas', 'Statistics'],
            devops: ['CI/CD Pipelines', 'Docker & Containerization', 'Kubernetes', 'Cloud Services (AWS/Azure)', 'Monitoring & Logging', 'Infrastructure as Code'],
            mobile: ['App Lifecycle', 'UI/Layouts', 'Performance Optimization', 'Offline Storage', 'Native vs Hybrid', 'State Management'],
            hr: ['Conflict Resolution', 'Leadership Situations', 'Handling Failure', 'Career Ambitions', 'Workplace Ethics', 'Team Collaboration', 'Adaptability']
        };

        let pool = [];
        if (mode === 'technical' && domain && topics[domain]) {
            pool = topics[domain];
        } else if (mode === 'hr') {
            pool = topics.hr;
        } else {
            return '';
        }

        // Shuffle and pick 2
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2).join(' and ');
    };

    const generateQuestions = async (interviewMode, selectedDomain = null, resumeData = null) => {
        setLoading(true);
        try {
            let prompt;
            if (interviewMode === 'technical' && resumeData) {
                const resumeContext = `Resume Summary: ${resumeData.resumeText?.substring(0, 1000) || 'N/A'}\nJob Title: ${resumeData.jobTitle || 'N/A'}\nSkills Mentioned: ${resumeData.skills?.join(', ') || 'N/A'}`;
                prompt = `Generate exactly 5 technical interview questions personalized to this candidate's resume. 

Resume Context:
${resumeContext}

Requirements:
- Questions should match their experience level and technologies
- Mix of conceptual, practical, and problem-solving questions
- Appropriate difficulty for their background
- IMPORTANT: Ask UNIQUE and DIVERSE questions compared to previous interviews. Focus on different projects or skills if possible.

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
                const focusAreas = getRandomFocusAreas('technical', selectedDomain);
                prompt = `Generate exactly 5 technical interview questions for a ${domainPrompts[selectedDomain]} role.

Requirements:
- Focus specifically on: ${focusAreas}
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
                const focusAreas = getRandomFocusAreas('hr', null);
                prompt = `Generate exactly 5 HR/behavioral interview questions.

Focus areas:
- ${focusAreas}
- General fit and soft skills

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
                let parsed = null;

                try {
                    parsed = JSON.parse(data.message);
                    if (Array.isArray(parsed)) {
                        setQuestions(parsed);
                        setLoading(false);
                        return parsed;
                    }
                } catch (e) {
                    // Not direct JSON
                }

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

    const submitAnswer = async () => {
        if (listening) {
            try {
                SpeechRecognition.stopListening();
            } catch (e) {
                console.warn('stopListening error:', e);
            }

            await new Promise((res) => setTimeout(res, 700));
        }

        const finalAnswer = transcript || '';

        const newAnswers = [...answers, {
            question: currentQuestion,
            answer: finalAnswer
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
        const avgAnswerLength = Math.round(allAnswers.reduce((sum, qa) => sum + (qa.answer?.length || 0), 0) / Math.max(1, totalQuestions));

        const score = avgAnswerLength > 120 ? 8 : avgAnswerLength > 60 ? 6 : 4;

        const strengths = [];
        if (avgAnswerLength > 120) strengths.push('Provided detailed responses');
        if (avgAnswerLength > 60) strengths.push('Answered all questions and engaged with prompts');
        if (strengths.length === 0) strengths.push('Attempted to answer questions');

        const improvements = [];
        if (avgAnswerLength <= 60) improvements.push('Give longer, more structured answers with examples');
        improvements.push('Focus on direct answers and include one specific result or metric when possible');
        if (interviewMode === 'technical') improvements.push('Add technical depth: mention key techniques or trade-offs');

        const qByQ = allAnswers.map((qa, idx) => {
            const short = (qa.answer || '').trim().replace(/\s+/g, ' ').slice(0, 140);
            const note = short.length === 0 ? 'No answer recorded.' : `Answer captured (${short.length} chars).`;
            return `Q${idx + 1}: ${note}`;
        }).join('\n');

        return `## Overall Score: ${score}/10\n\n**Strengths**\n- ${strengths.join('\n- ')}\n\n**Areas to Improve**\n- ${improvements.slice(0, 3).join('\n- ')}\n\n**Question Summary**\n${qByQ}\n\n**Next Steps**\n- Practice 2-3 STAR-structured answers for behavioral prompts.\n- For technical questions, state the approach, trade-offs, and one concrete example.`;
    };

    const formatFeedbackMarkdown = (text) => {
        if (!text || typeof text !== 'string') return text;

        const lines = text.split(/\r?\n/).map(l => l.replace(/\s+$/g, ''));
        const out = [];

        const isListItem = (ln) => /^\s*([-*+]\s+|\d+\.\s+)/.test(ln);
        const isHeading = (ln) => /^\s{0,3}#{1,6}\s+/.test(ln) || /^\s*\*\*/.test(ln);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') {
                if (out.length === 0 || out[out.length - 1] === '') continue;
                out.push('');
                continue;
            }

            if (isListItem(line)) {
                out.push(line);
                continue;
            }

            if (isHeading(line)) {
                if (out.length > 0 && out[out.length - 1] !== '') out.push('');
                out.push(line);
                const next = (lines[i + 1] || '').trim();
                if (next && !isListItem(next) && !isHeading(next)) out.push('');
                continue;
            }

            out.push(line);
            const nextLine = (lines[i + 1] || '').trim();
            if (nextLine && !isListItem(nextLine) && !isHeading(nextLine)) {
                out.push('');
            }
        }

        const resultLines = [];
        for (let j = 0; j < out.length; j++) {
            resultLines.push(out[j]);
        }

        const cleaned = resultLines.join('\n').replace(/\n{3,}/g, '\n\n');
        return cleaned.trim();
    };

    const getFinalFeedback = async (allAnswers) => {
        setLoading(true);
        setFinished(true);

        try {
            const interviewSummary = allAnswers.map((qa, idx) =>
                `**Q${idx + 1}:** ${qa.question}\n**A${idx + 1}:** ${qa.answer}`
            ).join('\n\n');

            const feedbackPrompt = mode === 'technical'
                ? `You are an expert technical interviewer. Provide concise feedback in Markdown.
FORMAT EXACTLY AS:

## Score: [X]/10

## Short Suggestion
[Provide a single, powerful improvement suggestion in 2-3 sentences max]

## Detailed Feedback
**Strengths**
- bullet1
- bullet2

**Improvements**
- bullet1
- bullet2

**Question Summary**
1. Q1: [1 sentence]
2. Q2: [1 sentence]

Here are the Q&A pairs:
${interviewSummary}`
                : `You are an expert HR interviewer. Provide concise feedback in Markdown.
FORMAT EXACTLY AS:

## Score: [X]/10

## Short Suggestion
[Provide a single, powerful improvement suggestion in 2-3 sentences max]

## Detailed Feedback
**Strengths**
- bullet1
- bullet2

**Improvements**
- bullet1
- bullet2

**Question Summary**
1. Q1: [1 sentence]
2. Q2: [1 sentence]

Here are the Q&A pairs:
${interviewSummary}`;

            try {
                const response = await fetch('http://localhost:5000/api/interview/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        interviewSummary,
                        mode
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success && data.message) {
                    setFinalFeedback(formatFeedbackMarkdown(data.message));
                } else {
                    throw new Error(data.error || data.details || 'Failed to get feedback');
                }
            } catch (fetchError) {
                console.error('Feedback fetch error:', fetchError);
                const fallbackFeedback = generateFallbackFeedback(allAnswers, mode);
                setFinalFeedback(formatFeedbackMarkdown(fallbackFeedback));
            }

            await awardXP('interview_complete', {}, token);
        } catch (error) {
            console.error('Error getting feedback:', error);
            setFinalFeedback(formatFeedbackMarkdown(`## Great Job! 🎉\n\nYou completed the ${mode} interview! Unfortunately, I couldn't connect to get detailed feedback, but you showed great effort in answering all questions.`));

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

    const handleBack = () => {
        if (finished) {
            handleRestart();
        } else if (mode && !domain && !useResume) {
            // In Domain Selection -> Go back to Mode Selection
            setMode(null);
        } else if (mode && (domain || useResume) && !started) {
            // In Ready Screen -> Go back to Domain Selection (if technical) or Mode Selection (if HR)
            if (mode === 'technical') {
                setDomain(null);
                setUseResume(false);
                setSelectedResume(null);
            } else {
                setMode(null);
            }
        }
    };

    const handleResumeUpload = async () => {
        if (!resumeFile || !user) return;

        setUploadingResume(true);
        try {
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

            const response = await fetch(`http://localhost:5000/api/match/user/${user.id}`);
            const data = await response.json();
            if (data.success && data.matches) {
                setUserResumes(data.matches);
                const latestResume = data.matches[0];
                setSelectedResume(latestResume);
                setUseResume(true);
                setResumeFile(null);
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
                <Sidebar
                    user={user}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                    onLogout={handleLogout}
                    onProfileClick={() => setShowProfileModal(true)}
                />
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full border-slate-200/50 shadow-sm">
                        <CardContent className="p-6 text-center">
                            <p className="text-slate-700">Browser doesn't support speech recognition. Please use Chrome.</p>
                            <Link to="/dashboard"><Button className="mt-4 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">Back to Dashboard</Button></Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
            {/* Mobile Sidebar Overlay */}
            <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <Sidebar
                    user={user}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                    onLogout={handleLogout}
                    onProfileClick={() => setShowProfileModal(true)}
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                />
            </SidebarOverlay>

            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
                onProfileClick={() => setShowProfileModal(true)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <nav className="border-b border-slate-200/50 bg-white sticky top-0 z-20 backdrop-blur-sm bg-white/80">
                    <div className="px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5 text-slate-700" />
                            </button>
                            {(mode || finished) && !started && (
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-slate-100 rounded-lg mr-2"
                                    title="Go Back"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                                </button>
                            )}
                            {!mode ? (
                                <span className="text-lg font-semibold text-slate-900">AI Mock Interview</span>
                            ) : mode && !domain && !useResume ? (
                                <span className="text-lg font-semibold text-slate-900">Select Domain</span>
                            ) : finished ? (
                                <span className="text-lg font-semibold text-slate-900">Interview Complete</span>
                            ) : (
                                <span className="text-lg font-semibold text-slate-900">
                                    {mode === 'technical' ? 'Technical' : 'HR'} Interview
                                </span>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Mode Selection Screen */}
                {!mode ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="max-w-4xl w-full">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Interview Type</h2>
                                <p className="text-slate-600 text-lg">Select the type of interview you want to practice</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Technical Interview */}
                                <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-slate-200 hover:border-blue-500 group border-slate-200/50 shadow-sm" onClick={() => setMode('technical')}>
                                    <CardContent className="p-8 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                                            <Briefcase className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Technical Interview</h3>
                                        <p className="text-slate-600 mb-6">
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
                                        <Button className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">Start Technical Interview</Button>
                                    </CardContent>
                                </Card>

                                {/* HR Interview */}
                                <Card className="cursor-pointer hover:shadow-xl transition-all border-2 border-slate-200 hover:border-blue-500 group border-slate-200/50 shadow-sm" onClick={() => setMode('hr')}>
                                    <CardContent className="p-8 text-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:from-cyan-200 group-hover:to-cyan-100 transition-colors">
                                            <Users className="w-10 h-10 text-cyan-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-3">HR Interview</h3>
                                        <p className="text-slate-600 mb-6">
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
                                        <Button className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">Start HR Interview</Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : mode === 'technical' && !domain && !useResume ? (
                    // Domain Selection Screen
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="max-w-6xl w-full">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Technical Domain</h2>
                                <p className="text-slate-600 text-lg">Select your area of expertise for tailored interview questions</p>
                            </div>

                            {/* Resume-Based Option */}
                            <div className="mb-8">
                                <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 border-slate-200/50 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-200">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 mb-2">Resume-Based Interview</h3>
                                                <p className="text-sm text-slate-600 mb-4">
                                                    Get personalized questions based on your uploaded resume and experience
                                                </p>

                                                {/* Upload Resume */}
                                                <div className="flex gap-3 items-end">
                                                    <div className="flex-1">
                                                        <label className="text-sm font-medium text-slate-700 mb-2 block">
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
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                                        />
                                                        {resumeFile && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Selected: {resumeFile.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={handleResumeUpload}
                                                        disabled={!resumeFile || uploadingResume}
                                                        className="whitespace-nowrap bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
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
                                    <span className="text-slate-500 text-sm">OR</span>
                                </div>
                            </div>

                            {/* Domain Options */}
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 text-center">Choose a Domain</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { id: 'frontend', name: 'Frontend Development', icon: Code, color: 'blue', description: 'HTML, CSS, JavaScript, React, Vue' },
                                        { id: 'backend', name: 'Backend Development', icon: Server, color: 'green', description: 'APIs, Databases, Server-side logic' },
                                        { id: 'fullstack', name: 'Full Stack Development', icon: Layers, color: 'purple', description: 'Frontend + Backend + Architecture' },
                                        { id: 'datascience', name: 'Data Science', icon: Database, color: 'pink', description: 'ML, Statistics, Data Analysis' },
                                        { id: 'devops', name: 'DevOps Engineering', icon: Cloud, color: 'orange', description: 'CI/CD, Cloud, Infrastructure' },
                                        { id: 'mobile', name: 'Mobile Development', icon: Smartphone, color: 'indigo', description: 'iOS, Android, Mobile UI/UX' }
                                    ].map((domainItem) => {
                                        const Icon = domainItem.icon;
                                        const colorClasses = {
                                            blue: 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600',
                                            green: 'bg-gradient-to-br from-green-100 to-green-50 text-green-600',
                                            purple: 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600',
                                            pink: 'bg-gradient-to-br from-pink-100 to-pink-50 text-pink-600',
                                            orange: 'bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600',
                                            indigo: 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600'
                                        };

                                        return (
                                            <Card
                                                key={domainItem.id}
                                                className="cursor-pointer hover:shadow-xl transition-all border-2 border-slate-200 hover:border-blue-500 group border-slate-200/50 shadow-sm"
                                                onClick={() => setDomain(domainItem.id)}
                                            >
                                                <CardContent className="p-6 text-center">
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${colorClasses[domainItem.color]}`}>
                                                        <Icon className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{domainItem.name}</h3>
                                                    <p className="text-sm text-slate-600">{domainItem.description}</p>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : finished ? (
                    // Results Screen
                    <div className="flex-1 max-w-3xl w-full mx-auto p-4 py-8">
                        {loading ? (
                            <Card className="p-12 text-center border-slate-200/50 shadow-sm">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-lg text-slate-600">Analyzing your {mode} interview performance...</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <Card className="bg-gradient-to-br from-blue-700 to-cyan-600 text-white border-none shadow-xl">
                                    <CardContent className="p-8 text-center">
                                        <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                                        <h2 className="text-3xl font-bold mb-2">{mode === 'technical' ? 'Technical' : 'HR'} Interview Complete!</h2>
                                        <p className="text-white/90">You answered all {questions.length} questions. Here's your feedback:</p>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-slate-200/50">
                                    <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 border-b border-slate-200">
                                        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                                            <CheckCircle className="w-6 h-6 text-blue-600" />
                                            Your Interview Feedback
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900">
                                            <ReactMarkdown>{finalFeedback}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex gap-4">
                                    <Link to="/dashboard" className="flex-1">
                                        <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">Back to Dashboard</Button>
                                    </Link>
                                    <Button className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white" onClick={handleRestart}>
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Interview Screen
                    <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col justify-center">
                        {!started ? (
                            <Card className="text-center p-8 border-slate-200/50 shadow-sm">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                                    <Mic className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready for your {mode} interview?</h2>
                                <p className="text-slate-600 mb-8">
                                    I'll ask you {mode} questions with AI voice narration. Answer each one, and you'll receive comprehensive feedback at the end.
                                </p>
                                <Button size="lg" onClick={startInterview} disabled={loading} className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Start Interview <Play className="ml-2 w-4 h-4" />
                                </Button>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <Card className="border-blue-200/50 shadow-lg border-slate-200/50">
                                    <CardHeader>
                                        <CardTitle className="text-blue-700 text-xl">Interview Question</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xl font-medium text-slate-900 leading-relaxed">{currentQuestion}</p>
                                    </CardContent>
                                </Card>

                                <div className="relative">
                                    <Card className={cn(
                                        "min-h-[250px] transition-all duration-300 border-slate-200/50",
                                        listening ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg" : "",
                                        countdown !== null ? "bg-gradient-to-br from-blue-50/50 to-cyan-50/50" : ""
                                    )}>
                                        <CardContent className="p-6 min-h-[250px] flex items-center justify-center">
                                            {countdown !== null ? (
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-7xl font-bold text-blue-600 mb-4 animate-pulse">{countdown}</div>
                                                    <p className="text-lg text-slate-600 font-medium">Get ready to answer...</p>
                                                </div>
                                            ) : transcript ? (
                                                <div className="w-full">
                                                    <p className="text-lg text-slate-700 leading-relaxed">{transcript}</p>
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 italic text-center">
                                                    {listening ? (
                                                        <span className="flex items-center gap-2 text-blue-600 font-medium">
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
                                            className="rounded-full w-14 h-14 shadow-xl bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                                            onClick={handleListen}
                                            disabled={countdown !== null}
                                        >
                                            {listening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
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
                )}
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default InterviewPage;