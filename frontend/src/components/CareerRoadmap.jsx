import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { CheckCircle, Circle, ArrowRight, Trophy, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const CareerRoadmap = ({ matchData }) => {
    // Mock roadmap steps based on match score
    const score = matchData?.overallScore || 0;

    const steps = [
        {
            title: "Profile Setup",
            description: "Create account and upload resume",
            status: "completed",
            icon: CheckCircle
        },
        {
            title: "Skill Analysis",
            description: "Identify gaps and strengths",
            status: "completed",
            icon: CheckCircle
        },
        {
            title: "Skill Building",
            description: "Learn missing skills (e.g., Docker, AWS)",
            status: score > 60 ? "completed" : "current",
            icon: score > 60 ? CheckCircle : Circle
        },
        {
            title: "Project Portfolio",
            description: "Build projects to showcase new skills",
            status: score > 80 ? "completed" : score > 60 ? "current" : "upcoming",
            icon: score > 80 ? CheckCircle : Circle
        },
        {
            title: "Interview Prep",
            description: "Practice behavioral and technical questions",
            status: score > 90 ? "completed" : score > 80 ? "current" : "upcoming",
            icon: score > 90 ? CheckCircle : Circle
        },
        {
            title: "Job Ready!",
            description: "Apply to your dream roles",
            status: score >= 95 ? "completed" : "upcoming",
            icon: Trophy
        }
    ];

    const progress = (steps.filter(s => s.status === "completed").length / steps.length) * 100;

    return (
        <Card className="h-full border-none shadow-none bg-transparent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Your Career Roadmap
                </CardTitle>
                <CardDescription>Follow these steps to land your dream job</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="text-primary font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>

                <div className="space-y-0">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-4 relative pb-8 last:pb-0">
                            {index !== steps.length - 1 && (
                                <div className={cn(
                                    "absolute left-3 top-8 bottom-0 w-0.5",
                                    step.status === "completed" ? "bg-primary" : "bg-gray-200"
                                )} />
                            )}
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-white",
                                step.status === "completed" ? "text-primary" :
                                    step.status === "current" ? "text-blue-600 ring-2 ring-blue-100" : "text-gray-300"
                            )}>
                                <step.icon className={cn("w-6 h-6", step.status === "completed" && "fill-primary/20")} />
                            </div>
                            <div className={cn(
                                "flex-1 -mt-1 p-3 rounded-lg transition-colors",
                                step.status === "current" ? "bg-blue-50 border border-blue-100" : ""
                            )}>
                                <h4 className={cn(
                                    "font-medium",
                                    step.status === "completed" ? "text-primary" :
                                        step.status === "current" ? "text-blue-700" : "text-gray-500"
                                )}>{step.title}</h4>
                                <p className="text-sm text-muted mt-1">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CareerRoadmap;
