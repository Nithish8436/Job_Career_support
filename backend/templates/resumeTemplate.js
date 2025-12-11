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
        @page { size: A4; margin: 0.6in; }

        html,body{height:100%;}
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.35;
            color: #000;
            background: #fff;
            margin: 0; /* @page controls printable margins */
            padding: 0; 
        }

        /* Container fits inside the printable area provided by @page */
        .container{max-width:100%;margin:0 auto;padding:0}

        /* Header */
        .header { text-align: center; margin-bottom: 6px; }
        .name { font-size: 24pt; font-weight: 700; letter-spacing: 0.6px; line-height:1; }
        .contact { margin-top:4px; font-size:9pt; color:#111; }
        .contact span{margin:0 8px}
        .hr { border-top:1.2px solid #111; margin:10px 0 6px 0 }

        /* Section title styling */
        .section { margin-top:10px; }
        .section-title { font-size:12pt; font-weight:700; text-transform:uppercase; margin-bottom:6px; }
        .section-rule { height:1px;background:#333;margin:6px 0 10px 0 }

        .summary { text-align:justify; font-size:10pt; margin-bottom:8px; }

        .skills-grid { margin-bottom:8px }
        .skill-row { margin-bottom:6px }
        .skill-label{font-weight:700; margin-right:6px}

        /* Projects and experience styling */
        .projects .project, .experience .job { margin-bottom:10px; page-break-inside: avoid }
        .project-title { font-weight:700; font-size:11pt }
        .project-meta{ font-style:italic; font-size:9pt; color:#333; margin-top:2px }
        .two-col { display:flex; justify-content:space-between; align-items:flex-start; gap:12px }
        .two-col > div { flex: 1 }
        .right { text-align:right; font-size:9pt; white-space:nowrap }

        ul.bullets { margin-left:18px; margin-top:6px; }
        ul.bullets li { margin-bottom:4px; font-size:10pt }

        .education-item{ margin-bottom:8px }
        .education-degree{ font-weight:700; font-size:11pt }
        .education-meta{ font-size:9pt }

        .certifications-list{ margin-left:18px }

        /* Ensure long sections don't split awkwardly */
        .section { page-break-inside: avoid }

        @media print { .name{font-size:23pt} }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="name">${name || 'Your Name'}</div>
            <div class="contact">
                ${contact.phone ? `<span>${contact.phone}</span>` : ''}
                ${contact.location ? `<span>${contact.location}</span>` : ''}
                ${contact.email ? `<span><a href="mailto:${contact.email}">${contact.email}</a></span>` : ''}
                ${contact.linkedin ? `<span>${contact.linkedin}</span>` : ''}
                ${contact.github ? `<span>${contact.github}</span>` : ''}
                ${contact.portfolio ? `<span>${contact.portfolio}</span>` : ''}
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
            <div>
                <ul class="bullets">${softSkills.map(s => `<li>${s}</li>`).join('')}</ul>
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
                    ${p.technologies ? `<div style="margin-top:6px;font-style:italic;font-size:9pt;">${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</div>` : ''}
                    ${p.description ? (Array.isArray(p.description) ? `<ul class="bullets">${p.description.map(d => `<li>${d}</li>`).join('')}</ul>` : `<p style="margin-top:6px">${p.description}</p>`) : ''}
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
                    ${e.responsibilities ? (Array.isArray(e.responsibilities) ? `<ul class="bullets">${e.responsibilities.map(r=>`<li>${r}</li>`).join('')}</ul>` : `<p style="margin-top:6px">${e.responsibilities}</p>`) : ''}
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
                    <div class="right">${ed.score ? ed.score : ''}<div style="font-size:9pt;margin-top:4px">${ed.dates||''}</div></div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${certifications && certifications.length ? `
        <div class="section">
            <div class="section-title">CERTIFICATIONS</div>
            <div class="section-rule"></div>
            <ul class="certifications-list">${certifications.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
        ` : ''}

    </div>
</body>
</html>
    `;
}

module.exports = { generateResumeTemplate };

