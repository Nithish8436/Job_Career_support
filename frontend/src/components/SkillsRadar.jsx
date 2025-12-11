import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';

const SkillsRadar = ({ matchData }) => {
    if (!matchData || !matchData.breakdown) return null;

    const data = [
        {
            subject: 'Skills',
            A: 100, // Ideal
            B: matchData.breakdown.skillsScore || 0, // User
            fullMark: 100,
        },
        {
            subject: 'Experience',
            A: 100,
            B: matchData.breakdown.experienceScore || 0,
            fullMark: 100,
        },
        {
            subject: 'Education',
            A: 100,
            B: matchData.breakdown.educationScore || 0,
            fullMark: 100,
        },
        {
            subject: 'Overall',
            A: 100,
            B: matchData.overallScore || 0,
            fullMark: 100,
        },
        // Adding some derived metrics for visual balance
        {
            subject: 'Keywords',
            A: 100,
            B: Math.min(100, (matchData.matchedSkills?.length || 0) * 10 + 20), // Rough estimate
            fullMark: 100,
        },
        {
            subject: 'Impact',
            A: 100,
            B: Math.min(100, (matchData.overallScore || 0) + 10), // Optimistic boost
            fullMark: 100,
        },
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Match Visualization</CardTitle>
                <CardDescription>How you stack up against the requirements</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Job Requirements"
                                dataKey="A"
                                stroke="#e5e7eb"
                                fill="#f3f4f6"
                                fillOpacity={0.6}
                            />
                            <Radar
                                name="Your Profile"
                                dataKey="B"
                                stroke="#2563eb"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                            />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default SkillsRadar;
