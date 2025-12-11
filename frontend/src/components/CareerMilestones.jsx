import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * CareerMilestones – vertical timeline showing user progress based on match score.
 * Props:
 *   matchData – first match object (contains overallScore, jobTitle, etc.)
 */
const milestones = [
    { id: 1, title: 'Profile Setup', description: 'Upload / edit your resume', minScore: 0, maxScore: 30, route: '/upload', icon: '📝' },
    { id: 2, title: 'Skill Gap Analysis', description: 'Identify missing skills', minScore: 31, maxScore: 60, route: '/match', icon: '🔎' },
    { id: 3, title: 'Project Portfolio', description: 'Add GitHub projects', minScore: 61, maxScore: 80, route: '/portfolio', icon: '💼' },
    { id: 4, title: 'Interview Prep', description: 'Practice mock interviews', minScore: 81, maxScore: 95, route: '/interview', icon: '🎤' },
    { id: 5, title: 'Job Ready', description: 'Apply to jobs & get AI cover letters', minScore: 96, maxScore: 100, route: '/jobs', icon: '🚀' },
];

const getStatus = (score, milestone) => {
    if (score >= milestone.maxScore) return 'completed';
    if (score >= milestone.minScore) return 'current';
    return 'upcoming';
};

const CareerMilestones = ({ matchData }) => {
    const score = matchData?.overallScore || 0;
    const progress = (milestones.filter(m => getStatus(score, m) === 'completed').length / milestones.length) * 100;

    return (
        <Card className="bg-white/80 border border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-xl font-bold">Career Milestones</span>
                </CardTitle>
                <CardDescription>Track your journey to a dream job</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Progress bar */}
                <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                        transition={{ duration: 0.8 }}
                    />
                </div>
                {/* Timeline items */}
                <div className="space-y-4">
                    {milestones.map((m, idx) => {
                        const status = getStatus(score, m);
                        const circleColor =
                            status === 'completed' ? 'bg-green-500' :
                                status === 'current' ? 'bg-primary' :
                                    'bg-gray-300';
                        const textColor = status === 'upcoming' ? 'text-gray-500' : 'text-gray-900';
                        return (
                            <div key={m.id} className="flex items-start gap-4">
                                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white', circleColor)}>
                                    {m.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className={cn('font-semibold', textColor)}>{m.title}</h4>
                                    <p className={cn('text-sm', textColor)}>{m.description}</p>
                                </div>
                                {status !== 'upcoming' && (
                                    <Link to={m.route}>
                                        <button className="flex items-center gap-1 text-primary hover:underline">
                                            {status === 'current' ? 'Start' : 'View'}
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default CareerMilestones;
