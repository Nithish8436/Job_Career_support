import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { CheckCircle, Lock, Circle, Trophy, Target, Zap, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Roadmap = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const roadmapSteps = [
        {
            id: 1,
            title: "Resume Basics",
            description: "Upload your first resume and get it analyzed",
            xpRequired: 0,
            xpReward: 100,
            icon: Target
        },
        {
            id: 2,
            title: "First Match",
            description: "Complete your first job match analysis",
            xpRequired: 100,
            xpReward: 150,
            icon: CheckCircle
        },
        {
            id: 3,
            title: "Quiz Master",
            description: "Score 80% or higher on a skills quiz",
            xpRequired: 250,
            xpReward: 200,
            icon: Trophy
        },
        {
            id: 4,
            title: "Interview Pro",
            description: "Complete a mock interview session",
            xpRequired: 450,
            xpReward: 250,
            icon: Zap
        },
        {
            id: 5,
            title: "Profile Optimizer",
            description: "Improve your resume score to 90+",
            xpRequired: 700,
            xpReward: 300,
            icon: Target
        },
        {
            id: 6,
            title: "Career Champion",
            description: "Complete 10 successful job matches",
            xpRequired: 1000,
            xpReward: 500,
            icon: Trophy
        }
    ];

    useEffect(() => {
        fetchProgress();

        // Listen for progress updates
        const handleProgressUpdate = () => {
            fetchProgress();
        };

        window.addEventListener('progress_updated', handleProgressUpdate);

        // Also refresh when window gains focus (in case update happened in another tab)
        window.addEventListener('focus', handleProgressUpdate);

        return () => {
            window.removeEventListener('progress_updated', handleProgressUpdate);
            window.removeEventListener('focus', handleProgressUpdate);
        };
    }, []);

    const fetchProgress = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/progress', {
                headers: {
                    'x-auth-token': token
                }
            });
            const data = await response.json();
            if (data.success) {
                setProgress(data.progress);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (step) => {
        if (!progress) return 'locked';

        // Check if milestone is completed
        const isCompleted = progress.completedMilestones.some(m => m.milestoneId === step.id);
        if (isCompleted) return 'completed';

        // Check if user has enough XP to start this milestone
        if (progress.xp >= step.xpRequired) return 'current';

        return 'locked';
    };

    const getCompletedCount = () => {
        if (!progress) return 0;
        return progress.completedMilestones.length;
    };

    const getCurrentCount = () => {
        if (!progress) return 0;
        return roadmapSteps.filter(step => getStepStatus(step) === 'current').length;
    };

    const getLockedCount = () => {
        if (!progress) return roadmapSteps.length;
        return roadmapSteps.filter(step => getStepStatus(step) === 'locked').length;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    const userLevel = progress?.level || 1;
    const userXP = progress?.xp || 0;
    const xpToNextLevel = userLevel * 500;
    const xpInCurrentLevel = userXP % 500;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Career Roadmap
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Level & XP Progress */}
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-purple-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Level {userLevel}</span>
                        <span className="text-xs text-gray-600">{xpInCurrentLevel} / {500} XP</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(xpInCurrentLevel / 500) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-purple-600"
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                        Total XP: {userXP}
                    </p>
                </div>

                {/* Roadmap Steps */}
                <div className="space-y-3">
                    {roadmapSteps.map((step, index) => {
                        const status = getStepStatus(step);
                        const Icon = step.icon;
                        const isCompleted = status === 'completed';
                        const isCurrent = status === 'current';
                        const isLocked = status === 'locked';

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative p-4 rounded-lg border-2 transition-all",
                                    isCompleted && "bg-green-50 border-green-200",
                                    isCurrent && "bg-blue-50 border-blue-400 shadow-md",
                                    isLocked && "bg-gray-50 border-gray-200 opacity-60"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                        isCompleted && "bg-green-500",
                                        isCurrent && "bg-blue-500",
                                        isLocked && "bg-gray-300"
                                    )}>
                                        {isLocked ? (
                                            <Lock className="w-5 h-5 text-white" />
                                        ) : isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        ) : (
                                            <Icon className="w-5 h-5 text-white" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-semibold mb-1",
                                            isCompleted && "text-green-900",
                                            isCurrent && "text-blue-900",
                                            isLocked && "text-gray-600"
                                        )}>
                                            {step.title}
                                        </h4>
                                        <p className={cn(
                                            "text-sm mb-2",
                                            isCompleted && "text-green-700",
                                            isCurrent && "text-blue-700",
                                            isLocked && "text-gray-500"
                                        )}>
                                            {step.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs">
                                            {!isCompleted && (
                                                <span className={cn(
                                                    "font-medium",
                                                    isCurrent ? "text-blue-600" : "text-gray-500"
                                                )}>
                                                    Requires {step.xpRequired} XP
                                                </span>
                                            )}
                                            <span className={cn(
                                                "font-medium",
                                                isCompleted && "text-green-600",
                                                isCurrent && "text-blue-600",
                                                isLocked && "text-gray-500"
                                            )}>
                                                +{step.xpReward} XP Reward
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {isCurrent && (
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                                ACTIVE
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Connector Line */}
                                {index < roadmapSteps.length - 1 && (
                                    <div className={cn(
                                        "absolute left-8 top-full w-0.5 h-3 -mb-3",
                                        isCompleted ? "bg-green-300" : "bg-gray-300"
                                    )} />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Achievements Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-900">Achievements</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-2xl font-bold text-yellow-700">{getCompletedCount()}</p>
                            <p className="text-xs text-yellow-600">Completed</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700">{getCurrentCount()}</p>
                            <p className="text-xs text-blue-600">In Progress</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-700">{getLockedCount()}</p>
                            <p className="text-xs text-gray-600">Locked</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {progress && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 text-center mb-2 font-semibold">Your Stats</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                                <p className="font-bold text-gray-900">{progress.stats.totalAnalyses}</p>
                                <p className="text-gray-600">Analyses</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{progress.stats.totalQuizzes}</p>
                                <p className="text-gray-600">Quizzes</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{progress.stats.totalInterviews}</p>
                                <p className="text-gray-600">Interviews</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Roadmap;
