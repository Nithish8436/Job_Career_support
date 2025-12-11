/**
 * Generate HTML for Match Report PDF
 * @param {Object} matchData - The match analysis data
 * @returns {string} HTML content
 */
const generateMatchReportHtml = (matchData) => {
    const score = matchData.overallScore || 0;
    const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#ca8a04' : '#dc2626';
    const scoreBg = score >= 80 ? '#dcfce7' : score >= 60 ? '#fef9c3' : '#fee2e2';

    // Format date
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Career Compass Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            background: #fff;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }

        /* Cover Page */
        .cover-page {
            height: 950px; /* Approximate A4 height minus margins */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            page-break-after: always;
            border-bottom: 5px solid #4f46e5;
        }

        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #4f46e5;
            margin-bottom: 40px;
            letter-spacing: -0.5px;
        }

        .report-title {
            font-size: 48px;
            font-weight: 900;
            color: #1e293b;
            margin-bottom: 20px;
            letter-spacing: -1px;
            line-height: 1.1;
        }

        .report-subtitle {
            font-size: 24px;
            color: #64748b;
            font-weight: 400;
            margin-bottom: 60px;
        }

        .score-circle {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: ${scoreBg};
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 40px;
            position: relative;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .score-value {
            font-size: 64px;
            font-weight: 900;
            color: ${scoreColor};
        }

        .score-label {
            font-size: 18px;
            font-weight: 600;
            color: #64748b;
            margin-top: 10px;
        }

        .meta-info {
            margin-top: auto;
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 40px;
        }

        /* Standard Page */
        .page {
            padding: 20px 0;
            page-break-inside: avoid;
        }

        h2 {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 30px 0 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .card-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #334155;
        }

        /* Progress Bars */
        .skill-metric {
            margin-bottom: 16px;
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        .progress-bar-bg {
            height: 10px;
            background: #f1f5f9;
            border-radius: 5px;
            overflow: hidden;
        }

        .progress-bar-fill {
            height: 100%;
            border-radius: 5px;
        }

        /* Tags */
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .tag {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }

        .tag.green { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .tag.red { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .tag.blue { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }

        /* Suggestions */
        .suggestion-item {
            padding: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 12px;
            background: #f8fafc;
        }
        .suggestion-item.high { border-left: 4px solid #ef4444; background: #fef2f2; }
        .suggestion-item.medium { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .suggestion-item.low { border-left: 4px solid #3b82f6; background: #eff6ff; }

        .suggestion-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        .priority-badge {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .bg-red { background: #fee2e2; color: #991b1b; }
        .bg-yellow { background: #fef3c7; color: #92400e; }
        .bg-blue { background: #dbeafe; color: #1e40af; }

        /* Grid */
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        /* Footer */
        .footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>

    <!-- COVER PAGE -->
    <div class="cover-page">
        <div class="logo">CAREER COMPASS</div>
        
        <h1 class="report-title">Career Analysis Report</h1>
        <h2 class="report-subtitle">Personalized Match & Skill Gap Analysis</h2>
        
        <div class="score-circle">
            <div>
                <div class="score-value">${score}%</div>
                <div class="score-label">Match Score</div>
            </div>
        </div>

        <div style="font-size: 18px; margin-bottom: 10px; font-weight: 600; color: #334155;">
            Target Role: ${matchData.jobTitle || 'Software Engineer'}
        </div>

        <div class="meta-info">
            Generated on ${date}
        </div>
    </div>

    <!-- METRICS & CRITICAL ANALYSIS -->
    <div class="page">
        <h2>📊 Executive Summary</h2>
        
        <div class="card">
            <div class="skill-metric">
                <div class="metric-header">
                    <span>Skills Alignment</span>
                    <span style="color: #16a34a">${matchData.breakdown?.skillsScore || 0}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${matchData.breakdown?.skillsScore || 0}%; background: #22c55e;"></div>
                </div>
            </div>
            <div class="skill-metric">
                <div class="metric-header">
                    <span>Experience Match</span>
                    <span style="color: #4f46e5">${matchData.breakdown?.experienceScore || 0}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${matchData.breakdown?.experienceScore || 0}%; background: #6366f1;"></div>
                </div>
            </div>
            <div class="skill-metric">
                <div class="metric-header">
                    <span>Education Fit</span>
                    <span style="color: #8b5cf6">${matchData.breakdown?.educationScore || 0}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${matchData.breakdown?.educationScore || 0}%; background: #a855f7;"></div>
                </div>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <div class="card-title" style="color: #15803d;">✅ Matched Skills</div>
                <div class="tags">
                    ${matchData.matchedSkills && matchData.matchedSkills.length > 0
            ? matchData.matchedSkills.map(skill => `<span class="tag green">${skill}</span>`).join('')
            : '<span style="color: #64748b; font-size: 14px;">No specific matches found.</span>'}
                </div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #b91c1c;">⚠️ Missing Skills</div>
                <div class="tags">
                    ${matchData.missingSkills && matchData.missingSkills.length > 0
            ? matchData.missingSkills.map(skill => `<span class="tag red">${skill}</span>`).join('')
            : '<span style="color: #64748b; font-size: 14px;">No critical missing skills.</span>'}
                </div>
            </div>
        </div>
    </div>

    <!-- RECOMMENDATIONS -->
    ${matchData.suggestions && matchData.suggestions.length > 0 ? `
    <div class="page">
        <h2>💡 AI Recommendations</h2>
        ${matchData.suggestions.map(suggestion => `
            <div class="suggestion-item ${suggestion.priority}">
                <div class="suggestion-header">
                    <span style="font-weight: 600; color: #334155;">Recommendation</span>
                    <span class="priority-badge ${suggestion.priority === 'high' ? 'bg-red' : suggestion.priority === 'medium' ? 'bg-yellow' : 'bg-blue'}">
                        ${suggestion.priority} Priority
                    </span>
                </div>
                <div style="font-size: 14px; color: #475569; margin-bottom: 8px;">
                    ${suggestion.suggested}
                </div>
                <div style="font-size: 12px; color: #64748b; font-style: italic;">
                    <strong>Why:</strong> ${suggestion.reason}
                </div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- GITHUB ANALYSIS -->
    ${matchData.githubAnalysis && matchData.githubAnalysis.isPresent ? `
    <div class="page">
        <h2>🧑‍💻 GitHub Profile Analysis</h2>
        <div class="card" style="background: #0f172a; color: white; border: none;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 12px; color: #94a3b8;">Activity Level</div>
                    <div style="font-size: 20px; font-weight: 700; color: ${matchData.githubAnalysis.activityLevel === 'High' ? '#4ade80' : '#facc15'};">
                        ${matchData.githubAnalysis.activityLevel}
                    </div>
                </div>
                <div>
                    <div style="font-size: 12px; color: #94a3b8;">Project Quality</div>
                    <div style="font-size: 20px; font-weight: 700; color: #60a5fa;">
                        ${matchData.githubAnalysis.projectQuality}
                    </div>
                </div>
            </div>
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                    ${matchData.githubAnalysis.analysis}
                </div>
            </div>
            <div style="font-size: 13px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 12px;">
                <strong> Recommendation:</strong> ${matchData.githubAnalysis.recommendation}
            </div>
        </div>
    </div>
    ` : ''}

    <div class="footer">
        Generated by Career Compass
    </div>

</body>
</html>
    `;
};

module.exports = { generateMatchReportHtml };
