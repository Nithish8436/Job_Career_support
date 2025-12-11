import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { CheckCircle, Lock, Circle, Trophy, Star, Zap, Target, BookOpen, Code, Users, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const CareerSkillTree = ({ matchData }) => {
    const score = matchData?.overallScore || 0;

    // Calculate user level based on score
    const getUserLevel = () => {
        if (score >= 90) return 5;
        if (score >= 75) return 4;
        if (score >= 60) return 3;
        if (score >= 40) return 2;
        return 1;
    };

    const level = getUserLevel();
    const xp = score * 10;
    const nextLevelXp = level * 200;

    // Skill tree nodes with branching paths
    const skillTree = {
        foundation: {
            id: 'foundation',
            title: 'Foundation',
            icon: Target,
            status: 'completed',
            level: 1,
            nodes: [
                { name: 'Resume Upload', completed: true, xp: 50 },
                { name: 'Profile Setup', completed: true, xp: 50 }
            ]
        },
        branches: [
            {
                id: 'technical',
                title: 'Technical Path',
                icon: Code,
                color: 'blue',
                unlocked: score >= 20,
                current: score >= 20 && score < 60,
                completed: score >= 60,
                level: 2,
                nodes: [
                    { name: 'Identify Skill Gaps', completed: score >= 30, xp: 100 },
                    { name: 'Learn Missing Tech', completed: score >= 50, xp: 150 },
                    { name: 'Build Projects', completed: score >= 60, xp: 200 }
                ]
            },
            {
                id: 'experience',
                title: 'Experience Path',
                icon: Briefcase,
                color: 'purple',
                unlocked: score >= 20,
                current: score >= 20 && score < 60,
                completed: score >= 60,
                level: 2,
                nodes: [
                    { name: 'Add Metrics', completed: score >= 35, xp: 100 },
                    { name: 'Showcase Impact', completed: score >= 55, xp: 150 },
                    { name: 'Portfolio Ready', completed: score >= 60, xp: 200 }
                ]
            },
            {
                id: 'soft-skills',
                title: 'Soft Skills Path',
                icon: Users,
                color: 'green',
                unlocked: score >= 20,
                current: score >= 20 && score < 60,
                completed: score >= 60,
                level: 2,
                nodes: [
                    { name: 'Communication', completed: score >= 40, xp: 100 },
                    { name: 'Leadership', completed: score >= 50, xp: 150 },
                    { name: 'Teamwork', completed: score >= 60, xp: 200 }
                ]
            }
        ],
        advanced: {
            id: 'advanced',
            title: 'Interview Mastery',
            icon: BookOpen,
            unlocked: score >= 60,
            current: score >= 60 && score < 90,
            completed: score >= 90,
            level: 3,
            nodes: [
                { name: 'Mock Interviews', completed: score >= 70, xp: 250 },
                { name: 'Behavioral Prep', completed: score >= 80, xp: 250 },
                { name: 'Technical Practice', completed: score >= 90, xp: 300 }
            ]
        },
        summit: {
            id: 'summit',
            title: 'Job Ready',
            icon: Trophy,
            unlocked: score >= 90,
            current: score >= 90,
            completed: score >= 95,
            level: 4,
            nodes: [
                { name: 'Apply to Jobs', completed: score >= 92, xp: 500 },
                { name: 'Network', completed: score >= 95, xp: 500 },
                { name: 'Land Offer', completed: score >= 100, xp: 1000 }
            ]
        }
    };

    // Calculate achievements
    const achievements = [
        { id: 'first_steps', name: 'First Steps', icon: Star, unlocked: score >= 10 },
        { id: 'skill_hunter', name: 'Skill Hunter', icon: Target, unlocked: score >= 40 },
        { id: 'builder', name: 'Builder', icon: Code, unlocked: score >= 60 },
        { id: 'interview_warrior', name: 'Interview Warrior', icon: Zap, unlocked: score >= 80 },
        { id: 'job_ready', name: 'Job Ready', icon: Trophy, unlocked: score >= 90 }
    ];

    const unlockedAchievements = achievements.filter(a => a.unlocked);

    const SkillNode = ({ node, color = 'blue', unlocked, completed }) => {
        const colorClasses = {
            blue: 'bg-blue-500 border-blue-600',
            purple: 'bg-purple-500 border-purple-600',
            green: 'bg-green-500 border-green-600'
        };

        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                    completed ? `${colorClasses[color]} text-white shadow-md` :
                        unlocked ? "bg-gray-100 border-2 border-gray-300 text-gray-700" :
                            "bg-gray-50 border-2 border-gray-200 text-gray-400"
                )}
            >
                {completed ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : unlocked ? (
                    <Circle className="w-4 h-4 flex-shrink-0" />
                ) : (
                    <Lock className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-medium">{node.name}</span>
                {completed && <span className="ml-auto text-xs opacity-80">+{node.xp} XP</span>}
            </motion.div>
        );
    };

    const PathCard = ({ path, color }) => {
        const Icon = path.icon;
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            purple: 'from-purple-500 to-purple-600',
            green: 'from-green-500 to-green-600'
        };

        return (
            <div className="flex flex-col items-center">
                <motion.div
                    whileHover={{ scale: path.unlocked ? 1.05 : 1 }}
                    className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all",
                        path.completed ? `bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg` :
                            path.current ? `bg-gradient-to-br ${colorClasses[color]} text-white shadow-md animate-pulse` :
                                path.unlocked ? "bg-gray-200 text-gray-600" :
                                    "bg-gray-100 text-gray-300"
                    )}
                >
                    {path.unlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                </motion.div>
                <h4 className={cn(
                    "font-semibold text-sm mb-3 text-center",
                    path.unlocked ? "text-gray-900" : "text-gray-400"
                )}>{path.title}</h4>
                <div className="space-y-2 w-full">
                    {path.nodes.map((node, idx) => (
                        <SkillNode
                            key={idx}
                            node={node}
                            color={color}
                            unlocked={path.unlocked}
                            completed={node.completed}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Level & XP Card */}
            <Card className="bg-gradient-to-br from-primary to-purple-600 text-white border-none shadow-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Career Level</p>
                            <h3 className="text-3xl font-bold">Level {level}</h3>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Trophy className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/80">Progress to Level {level + 1}</span>
                            <span className="font-bold">{xp} / {nextLevelXp} XP</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(xp / nextLevelXp) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skill Tree */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Your Career Skill Tree
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-8">
                        {/* Foundation */}
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3">
                                <Target className="w-10 h-10" />
                            </div>
                            <h4 className="font-semibold mb-3">Foundation</h4>
                            <div className="flex gap-2">
                                {skillTree.foundation.nodes.map((node, idx) => (
                                    <div key={idx} className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        {node.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Connector Line */}
                        <div className="flex justify-center">
                            <div className="w-0.5 h-8 bg-gradient-to-b from-green-500 to-gray-300" />
                        </div>

                        {/* Three Branches */}
                        <div className="grid grid-cols-3 gap-4">
                            <PathCard path={skillTree.branches[0]} color="blue" />
                            <PathCard path={skillTree.branches[1]} color="purple" />
                            <PathCard path={skillTree.branches[2]} color="green" />
                        </div>

                        {/* Connector Lines */}
                        <div className="flex justify-center">
                            <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-orange-500" />
                        </div>

                        {/* Advanced */}
                        <div className="flex justify-center">
                            <div className="w-full max-w-xs">
                                <PathCard path={skillTree.advanced} color="blue" />
                            </div>
                        </div>

                        {/* Connector to Summit */}
                        <div className="flex justify-center">
                            <div className="w-0.5 h-8 bg-gradient-to-b from-orange-500 to-yellow-500" />
                        </div>

                        {/* Summit */}
                        <div className="flex justify-center">
                            <div className="w-full max-w-xs">
                                <PathCard path={skillTree.summit} color="purple" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Achievements ({unlockedAchievements.length}/{achievements.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3 flex-wrap">
                        {achievements.map((achievement) => {
                            const Icon = achievement.icon;
                            return (
                                <motion.div
                                    key={achievement.id}
                                    whileHover={{ scale: achievement.unlocked ? 1.1 : 1 }}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                                        achievement.unlocked
                                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg"
                                            : "bg-gray-100 text-gray-400"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-xs font-medium text-center">{achievement.name}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CareerSkillTree;
