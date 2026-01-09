/**
 * ATS-Friendly Resume Template
 * Based on the standard format shown in the example resume
 * This ensures consistency across all enhanced resumes
 */

function generateResumeTemplate(resumeData) {
    const {
        name = '',
        contact = {},
        summary = '',
        technicalSkills = {},
        softSkills = [],
        projects = [],
        experience = [],
        education = [],
        certifications = []
    } = resumeData;
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name || 'Resume'}</title>
    <style>
        /* Enforce consistent PDF margins via @page. Adjust margin value here to change PDF margins. */
        @page { size: A4; margin: 0.5in; }

        html,body{height:100%;}
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10.5pt;
            line-height: 1.25;
            color: #000;
            background: #fff;
            margin: 0; /* @page controls printable margins */
            padding: 0; 
        }

        /* Container fits inside the printable area provided by @page */
        .container{max-width:100%;margin:0 auto;padding:0}

        /* Header */
        .header { text-align: center; margin-bottom: 4px; }
        .name { font-size: 22pt; font-weight: 700; letter-spacing: 0.6px; line-height:1; }
        .contact { margin-top:4px; font-size:9pt; color:#111; }
        .contact span{margin:0 6px}
        .hr { border-top:1px solid #111; margin:8px 0 6px 0 }

        /* Section title styling */
        .section { margin-top:8px; }
        .section-title { font-size:11pt; font-weight:700; text-transform:uppercase; margin-bottom:4px; }
        .section-rule { height:1px;background:#333;margin:4px 0 6px 0 }

        .summary { text-align:justify; font-size:10pt; margin-bottom:6px; }

        .skills-grid { margin-bottom:6px }
        .skill-row { margin-bottom:4px }
        .skill-label{font-weight:700; margin-right:6px}

        /* Projects and experience styling */
        .projects .project, .experience .job { margin-bottom:8px; page-break-inside: avoid }
        .project-title { font-weight:700; font-size:10.5pt }
        .project-meta{ font-style:italic; font-size:9pt; color:#333; margin-top:1px }
        .two-col { display:flex; justify-content:space-between; align-items:flex-start; gap:12px }
        .two-col > div { flex: 1 }
        .right { text-align:right; font-size:9pt; white-space:nowrap }

        ul.bullets { margin-left:16px; margin-top:4px; }
        ul.bullets li { margin-bottom:2px; font-size:10pt }

        .education-item{ margin-bottom:6px }
        .education-degree{ font-weight:700; font-size:10.5pt }
        .education-meta{ font-size:9pt }

        .certifications-list{ margin-left:16px }
        .comma-list { font-size: 10pt; margin-left: 0; }

        /* Ensure long sections don't split awkwardly */
        .section { page-break-inside: avoid }

        @media print { .name{font-size:22pt} }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="name">${name || 'Your Name'}</div>
            <div class="contact">
                ${contact.phone ? `<span>${contact.phone}</span> • ` : ''}
                ${contact.location ? `<span>${contact.location}</span> • ` : ''}
                ${contact.email ? `<span><a href="mailto:${contact.email}" style="color:inherit;text-decoration:none">${contact.email}</a></span>` : ''}
                ${contact.linkedin ? ` • <span>${contact.linkedin.replace(/^https?:\/\//, '')}</span>` : ''}
                ${contact.github ? ` • <span>${contact.github.replace(/^https?:\/\//, '')}</span>` : ''}
                ${contact.portfolio ? ` • <span>${contact.portfolio.replace(/^https?:\/\//, '')}</span>` : ''}
            </div>
        </div>
        <div class="hr"></div>

        ${summary ? `
        <div class="section summary">
            <div class="section-title">SUMMARY</div>
            <div class="section-rule"></div>
            <div class="summary-text">${summary}</div>
        </div>
        ` : ''}

        ${Object.keys(technicalSkills || {}).length > 0 ? `
        <div class="section skills">
            <div class="section-title">TECHNICAL SKILLS</div>
            <div class="section-rule"></div>
            <div class="skills-grid">
                ${Object.entries(technicalSkills).map(([cat, skills]) => `
                    <div class="skill-row"><span class="skill-label">${cat}:</span> ${Array.isArray(skills) ? skills.join(', ') : skills}</div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${softSkills && softSkills.length ? `
        <div class="section">
            <div class="section-title">SOFT SKILLS</div>
            <div class="section-rule"></div>
            <div class="comma-list">
                ${Array.isArray(softSkills) ? softSkills.join(' • ') : softSkills}
            </div>
        </div>
        ` : ''}

        ${projects && projects.length ? `
        <div class="section projects">
            <div class="section-title">PROJECTS</div>
            <div class="section-rule"></div>
            ${projects.map(p => `
                <div class="project">
                    <div class="two-col">
                        <div>
                            <div class="project-title">${p.title || 'Project Title'}</div>
                            ${p.role ? `<div class="project-meta">${p.role}</div>` : ''}
                        </div>
                        <div class="right">${p.dates || ''}</div>
                    </div>
                    ${p.technologies ? `<div style="margin-top:2px;font-style:italic;font-size:9pt;">${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
                    ${p.description ? (Array.isArray(p.description) ? `<ul class="bullets">${p.description.map(d => `<li>${d}</li>`).join('')}</ul>` : `<p style="margin-top:4px">${p.description}</p>`) : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${experience && experience.length ? `
        <div class="section experience">
            <div class="section-title">EXPERIENCE</div>
            <div class="section-rule"></div>
            ${experience.map(e => `
                <div class="job">
                    <div class="two-col">
                        <div>
                            <div class="project-title">${e.company || 'Company Name'}</div>
                            ${e.role ? `<div class="project-meta">${e.role}</div>` : ''}
                            ${e.location ? `<div class="project-meta">${e.location}</div>` : ''}
                        </div>
                        <div class="right">${e.dates || ''}</div>
                    </div>
                    ${e.responsibilities ? (Array.isArray(e.responsibilities) ? `<ul class="bullets">${e.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>` : `<p style="margin-top:4px">${e.responsibilities}</p>`) : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${education && education.length ? `
        <div class="section">
            <div class="section-title">EDUCATION</div>
            <div class="section-rule"></div>
            ${education.map(ed => `
                <div class="education-item two-col">
                    <div>
                        <div class="education-degree">${ed.degree || ''}</div>
                        <div class="education-meta">${ed.institution || ''}${ed.location ? `, ${ed.location}` : ''}</div>
                    </div>
                    <div class="right">${ed.score ? ed.score : ''}<div style="font-size:9pt;margin-top:2px">${ed.dates || ''}</div></div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${certifications && certifications.length ? `
        <div class="section">
            <div class="section-title">CERTIFICATIONS</div>
            <div class="section-rule"></div>
            <div class="comma-list">
                ${Array.isArray(certifications) ? certifications.join(' • ') : certifications}
            </div>
        </div>
        ` : ''}

    </div>
</body>
</html>
    `;
}

module.exports = { generateResumeTemplate };

