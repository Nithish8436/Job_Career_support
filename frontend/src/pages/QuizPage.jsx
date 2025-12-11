import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { awardXP } from '../lib/progressHelper';

const QuizPage = () => {
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [finished, setFinished] = useState(false);
    const { token } = useAuth();

    const generateQuiz = async () => {
        setLoading(true);
        try {
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

            const data = await response.json();
            if (data.success) {
                const jsonMatch = data.message.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setQuestions(parsed);
                    setUserAnswers(new Array(parsed.length).fill(null));
                    setStarted(true);
                }
            }
        } catch (error) {
            console.error('Error generating quiz:', error);
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
            setQuestions(fallbackQuestions);
            setUserAnswers(new Array(fallbackQuestions.length).fill(null));
            setStarted(true);
        } finally {
            setLoading(false);
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

        // Award XP for quiz completion
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

    if (!started) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="font-bold text-lg">Interactive Quiz</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full text-center p-8">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Test Your Knowledge</h2>
                        <p className="text-muted mb-8">
                            Answer all questions, then submit to see your score and detailed feedback.
                        </p>
                        <Button
                            size="lg"
                            onClick={generateQuiz}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Start Quiz
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    if (finished) {
        const score = calculateScore();
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="font-bold text-lg">Quiz Results</h1>
                        <div className="w-10"></div>
                    </div>
                </header>

                <div className="flex-1 max-w-4xl w-full mx-auto p-4 py-8 space-y-6">
                    {/* Score Card */}
                    <Card className="text-center p-8">
                        <div className={cn(
                            "w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-bold",
                            percentage >= 80 ? "bg-green-100 text-green-600" :
                                percentage >= 60 ? "bg-yellow-100 text-yellow-600" :
                                    "bg-red-100 text-red-600"
                        )}>
                            {percentage}%
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {percentage >= 80 ? "Excellent! 🎉" :
                                percentage >= 60 ? "Good Job! 👍" :
                                    "Keep Practicing! 💪"}
                        </h2>
                        <p className="text-muted mb-8">
                            You scored {score} out of {questions.length} questions correctly.
                        </p>
                    </Card>

                    {/* Detailed Results */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Question-by-Question Review</h3>
                        {questions.map((q, index) => {
                            const userAnswer = userAnswers[index];
                            const isCorrect = userAnswer === q.correctIndex;

                            return (
                                <Card key={index} className={cn(
                                    "border-2",
                                    isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                                )}>
                                    <CardHeader>
                                        <div className="flex items-start gap-3">
                                            {isCorrect ? (
                                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                            )}
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">Question {index + 1}</CardTitle>
                                                <p className="text-base text-gray-700 font-medium">{q.question}</p>
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
                                                    optIndex !== q.correctIndex && userAnswer !== optIndex && "bg-white border-gray-200"
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

                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                                            <p className="text-sm text-blue-800">{q.explanation}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={restart} className="flex-1">
                            Try Again
                        </Button>
                        <Link to="/dashboard" className="flex-1">
                            <Button className="w-full">Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const allQuestionsAnswered = userAnswers.every(answer => answer !== null);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">
                            Question {currentIndex + 1} of {questions.length}
                        </span>
                        <span className="text-sm font-medium text-primary">
                            Answered: {userAnswers.filter(a => a !== null).length}/{questions.length}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-2xl w-full mx-auto p-4 flex flex-col justify-center">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-xl">{currentQ.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {currentQ.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5",
                                    userAnswers[currentIndex] === index && "border-primary bg-primary/10",
                                    "cursor-pointer"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                        userAnswers[currentIndex] === index ? "bg-primary border-primary" : "border-gray-300"
                                    )}>
                                        {userAnswers[currentIndex] === index && (
                                            <div className="w-3 h-3 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <span className="font-medium">{option}</span>
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
                        className="flex-1"
                    >
                        Previous
                    </Button>
                    {isLastQuestion ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!allQuestionsAnswered}
                            className="flex-1"
                        >
                            Submit Quiz
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            className="flex-1"
                        >
                            Next <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    )}
                </div>

                {!allQuestionsAnswered && isLastQuestion && (
                    <p className="text-sm text-amber-600 text-center mt-4 flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Please answer all questions before submitting
                    </p>
                )}
            </div>
        </div>
    );
};

export default QuizPage;
