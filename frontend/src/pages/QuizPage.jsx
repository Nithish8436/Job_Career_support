import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Loader2, ArrowRight, AlertCircle, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { awardXP } from '../lib/progressHelper';
import Sidebar from '../components/Sidebar';
import SidebarOverlay from '../components/SidebarOverlay';
import ProfileModal from '../components/ProfileModal';

const QuizPage = () => {
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [finished, setFinished] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
    };

    const generateQuiz = async () => {
        console.log('🎯 generateQuiz called!');
        setLoading(true);
        console.log('🔄 Loading set to true');
        try {
            console.log('📡 Making API request to /api/chat');
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    message: `Generate 5 multiple choice questions about common interview topics (behavioral, technical, career). Format EXACTLY as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this is correct"
  }
]
Return ONLY the JSON array, no other text.`,
                    history: []
                })
            });

            console.log('✅ API response received');
            const data = await response.json();
            console.log('📦 Response data:', data);
            console.log('🔍 data.success:', data.success);

            let quizStarted = false;

            if (data.success) {
                console.log('✅ Success is true, parsing message');
                console.log('📄 Message:', data.message);
                const jsonMatch = data.message.match(/\[[\s\S]*\]/);
                console.log('🔎 JSON match:', jsonMatch);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        console.log('✅ Parsed questions:', parsed.length);
                        setQuestions(parsed);
                        setUserAnswers(new Array(parsed.length).fill(null));
                        setStarted(true);
                        quizStarted = true;
                        console.log('✅ Quiz started with AI questions');
                    } catch (parseError) {
                        console.error('❌ Error parsing JSON:', parseError);
                    }
                } else {
                    console.log('❌ No JSON match found in message');
                }
            } else {
                console.log('❌ data.success is false or undefined');
            }

            // If quiz didn't start with AI questions, use fallback
            if (!quizStarted) {
                console.log('📝 Using fallback questions because AI response was invalid');
                throw new Error('Invalid API response, using fallback');
            }
        } catch (error) {
            console.error('❌ Error generating quiz:', error);
            console.log('📝 Using fallback questions');
            // Fallback questions
            const fallbackQuestions = [
                {
                    question: "What is the STAR method used for in interviews?",
                    options: [
                        "Situation, Task, Action, Result",
                        "Strategy, Tactics, Analysis, Review",
                        "Start, Think, Act, Reflect",
                        "Skills, Training, Achievements, References"
                    ],
                    correctIndex: 0,
                    explanation: "STAR stands for Situation, Task, Action, Result - a framework for answering behavioral questions."
                },
                {
                    question: "Which of these is NOT a good practice for resume writing?",
                    options: [
                        "Using action verbs",
                        "Including a photo",
                        "Quantifying achievements",
                        "Tailoring to the job"
                    ],
                    correctIndex: 1,
                    explanation: "In most countries, including a photo on your resume is not recommended and can lead to bias."
                },
                {
                    question: "What does ATS stand for in job applications?",
                    options: [
                        "Automated Testing System",
                        "Applicant Tracking System",
                        "Advanced Technical Screening",
                        "Application Transfer Service"
                    ],
                    correctIndex: 1,
                    explanation: "ATS (Applicant Tracking System) is software used by employers to filter and rank resumes."
                },
                {
                    question: "Which is the best way to follow up after an interview?",
                    options: [
                        "Call immediately after leaving",
                        "Send a thank-you email within 24 hours",
                        "Wait for them to contact you",
                        "Send a gift to the interviewer"
                    ],
                    correctIndex: 1,
                    explanation: "Sending a professional thank-you email within 24 hours shows appreciation and keeps you top of mind."
                },
                {
                    question: "What is the ideal length for a resume for someone with 5 years of experience?",
                    options: [
                        "Half a page",
                        "1 page",
                        "1-2 pages",
                        "3-4 pages"
                    ],
                    correctIndex: 2,
                    explanation: "For mid-level professionals, 1-2 pages is ideal to showcase relevant experience without overwhelming the reader."
                }
            ];
            console.log('✅ Fallback questions created:', fallbackQuestions.length);
            setQuestions(fallbackQuestions);
            console.log('✅ Questions state set');
            setUserAnswers(new Array(fallbackQuestions.length).fill(null));
            console.log('✅ User answers initialized');
            setStarted(true);
            console.log('✅ Started set to true');
        } finally {
            setLoading(false);
            console.log('🏁 Loading set to false');
        }
    };

    const handleSelectAnswer = (answerIndex) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentIndex] = answerIndex;
        setUserAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        const score = calculateScore();
        const percentage = Math.round((score / questions.length) * 100);

        await awardXP('quiz_complete', { score: percentage }, token);

        setFinished(true);
    };

    const calculateScore = () => {
        let correct = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === questions[index].correctIndex) {
                correct++;
            }
        });
        return correct;
    };

    const restart = () => {
        setStarted(false);
        setCurrentIndex(0);
        setUserAnswers([]);
        setFinished(false);
        setQuestions([]);
    };

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
                            {!started ? (
                                <span className="text-lg font-semibold text-slate-900">Interactive Quiz</span>
                            ) : finished ? (
                                <span className="text-lg font-semibold text-slate-900">Quiz Results</span>
                            ) : (
                                <span className="text-lg font-semibold text-slate-900">Quiz in Progress</span>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Main Content Area - Changed from flex-1 to this structure */}
                <div className="flex-1 flex items-center justify-center p-4">
                    {!started ? (
                        <Card className="max-w-md w-full text-center p-8 border-slate-200/50 shadow-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                                <Trophy className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Test Your Knowledge</h2>
                            <p className="text-slate-600 mb-8">
                                Answer all questions, then submit to see your score and detailed feedback.
                            </p>
                            <Button
                                size="lg"
                                onClick={generateQuiz}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Start Quiz
                            </Button>
                        </Card>
                    ) : finished ? (
                        <div className="max-w-4xl w-full mx-auto space-y-6">
                            {/* Score Card */}
                            <Card className="text-center p-8 border-slate-200/50 shadow-sm">
                                <div className={cn(
                                    "w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-bold",
                                    calculateScore() >= 4 ? "bg-gradient-to-br from-green-100 to-green-50 text-green-600" :
                                        calculateScore() >= 3 ? "bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600" :
                                            "bg-gradient-to-br from-red-100 to-red-50 text-red-600"
                                )}>
                                    {Math.round((calculateScore() / questions.length) * 100)}%
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    {calculateScore() >= 4 ? "Excellent! 🎉" :
                                        calculateScore() >= 3 ? "Good Job! 👍" :
                                            "Keep Practicing! 💪"}
                                </h2>
                                <p className="text-slate-600 mb-8">
                                    You scored {calculateScore()} out of {questions.length} questions correctly.
                                </p>
                            </Card>

                            {/* Detailed Results */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-900">Question-by-Question Review</h3>
                                {questions.map((q, index) => {
                                    const userAnswer = userAnswers[index];
                                    const isCorrect = userAnswer === q.correctIndex;

                                    return (
                                        <Card key={index} className={cn(
                                            "border-2 border-slate-200/50",
                                            isCorrect ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100/50" : "border-red-200 bg-gradient-to-br from-red-50 to-red-100/50"
                                        )}>
                                            <CardHeader>
                                                <div className="flex items-start gap-3">
                                                    {isCorrect ? (
                                                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                                    ) : (
                                                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                                    )}
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg text-slate-900 mb-2">Question {index + 1}</CardTitle>
                                                        <p className="text-base text-slate-700 font-medium">{q.question}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {q.options.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2",
                                                            optIndex === q.correctIndex && "bg-green-100 border-green-500",
                                                            userAnswer === optIndex && optIndex !== q.correctIndex && "bg-red-100 border-red-500",
                                                            optIndex !== q.correctIndex && userAnswer !== optIndex && "bg-white border-slate-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {optIndex === q.correctIndex && (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            )}
                                                            {userAnswer === optIndex && optIndex !== q.correctIndex && (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            )}
                                                            <span className={cn(
                                                                "text-sm",
                                                                optIndex === q.correctIndex && "font-semibold text-green-900",
                                                                userAnswer === optIndex && optIndex !== q.correctIndex && "font-semibold text-red-900"
                                                            )}>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                                                    <p className="text-sm text-blue-800">{q.explanation}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={restart} className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                                    Try Again
                                </Button>
                                <Link to="/dashboard" className="flex-1">
                                    <Button className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl w-full mx-auto">
                            <Card className="mb-6 border-slate-200/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl text-slate-900">{questions[currentIndex].question}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {questions[currentIndex].options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectAnswer(index)}
                                            className={cn(
                                                "w-full p-4 rounded-xl border-2 text-left transition-all hover:border-blue-500 hover:bg-blue-50/50 border-slate-200",
                                                userAnswers[currentIndex] === index && "border-blue-500 bg-blue-50/50",
                                                "cursor-pointer"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                                    userAnswers[currentIndex] === index ? "bg-blue-500 border-blue-500" : "border-slate-300"
                                                )}>
                                                    {userAnswers[currentIndex] === index && (
                                                        <div className="w-3 h-3 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-900">{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Navigation */}
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    Previous
                                </Button>
                                {currentIndex === questions.length - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={userAnswers.some(a => a === null)}
                                        className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                                    >
                                        Submit Quiz
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        className="flex-1 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                                    >
                                        Next <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                )}
                            </div>

                            {userAnswers.some(a => a === null) && currentIndex === questions.length - 1 && (
                                <p className="text-sm text-amber-600 text-center mt-4 flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Please answer all questions before submitting
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default QuizPage;