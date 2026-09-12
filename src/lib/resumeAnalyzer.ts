import { AnalysisResult } from '@/types';

interface JobRoleProfile {
  keywords: string[];
  requiredSections: string[];
  commonSkills: string[];
  softSkills: string[];
  educationKeywords: string[];
}

const JOB_ROLE_PROFILES: Record<string, JobRoleProfile> = {
  'software engineer': {
    keywords: ['software', 'engineer', 'developer', 'programming', 'code', 'algorithm', 'data structure', 'git', 'agile', 'scrum', 'api', 'backend', 'frontend', 'fullstack', 'full stack', 'database', 'testing', 'debug', 'deployment', 'ci/cd', 'docker', 'kubernetes', 'cloud', 'aws', 'azure', 'gcp', 'microservices', 'rest', 'graphql'],
    requiredSections: ['experience', 'skills', 'education'],
    commonSkills: ['java', 'python', 'javascript', 'typescript', 'react', 'node.js', 'c++', 'go', 'ruby', 'sql', 'mongodb', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'jenkins', 'git', 'linux', 'html', 'css', 'vue', 'angular', 'django', 'flask', 'spring', 'express'],
    softSkills: ['problem solving', 'teamwork', 'communication', 'collaboration', 'analytical', 'leadership'],
    educationKeywords: ['computer science', 'engineering', 'software', 'information technology', 'b.tech', 'b.e', 'm.tech', 'msc'],
  },
  'data analyst': {
    keywords: ['data', 'analyst', 'analytics', 'sql', 'excel', 'tableau', 'power bi', 'python', 'r', 'statistics', 'reporting', 'dashboard', 'visualization', 'insights', 'trends', 'kpi', 'metrics', 'etl', 'data mining', 'data cleaning', 'pandas', 'numpy'],
    requiredSections: ['experience', 'skills', 'education'],
    commonSkills: ['sql', 'python', 'r', 'excel', 'tableau', 'power bi', 'pandas', 'numpy', 'matplotlib', 'statistics', 'data visualization', 'etl', 'sas', 'spss', 'google analytics', 'looker'],
    softSkills: ['analytical', 'attention to detail', 'communication', 'problem solving', 'critical thinking'],
    educationKeywords: ['statistics', 'mathematics', 'data science', 'economics', 'business analytics', 'computer science'],
  },
  'product manager': {
    keywords: ['product', 'manager', 'roadmap', 'strategy', 'stakeholder', 'user', 'market', 'research', 'agile', 'scrum', 'sprint', 'backlog', 'feature', 'requirement', 'prioritization', 'kpi', 'okr', 'launch', 'go-to-market', 'user story', 'jira', 'analytics'],
    requiredSections: ['experience', 'education'],
    commonSkills: ['jira', 'confluence', 'agile', 'scrum', 'roadmapping', 'user research', 'a/b testing', 'google analytics', 'mixpanel', 'amplitude', 'figma', 'wireframing', 'sql', 'stakeholder management'],
    softSkills: ['leadership', 'communication', 'strategic thinking', 'decision making', 'collaboration', 'negotiation'],
    educationKeywords: ['business', 'mba', 'management', 'engineering', 'computer science', 'economics'],
  },
  'data scientist': {
    keywords: ['data', 'scientist', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'python', 'model', 'deep learning', 'neural', 'nlp', 'tensorflow', 'pytorch', 'scikit', 'regression', 'classification', 'clustering', 'predictive', 'model', 'feature engineering', 'data preprocessing'],
    requiredSections: ['experience', 'skills', 'education'],
    commonSkills: ['python', 'r', 'sql', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'spark', 'hadoop', 'aws', 'azure ml', 'nlp', 'computer vision', 'deep learning', 'statistics', 'jupyter', 'git'],
    softSkills: ['analytical', 'problem solving', 'communication', 'curiosity', 'critical thinking'],
    educationKeywords: ['computer science', 'data science', 'statistics', 'mathematics', 'machine learning', 'ai', 'engineering'],
  },
  'ui ux designer': {
    keywords: ['ui', 'ux', 'design', 'user', 'interface', 'experience', 'figma', 'sketch', 'prototype', 'wireframe', 'design system', 'user research', 'usability', 'accessibility', 'interaction', 'visual', 'adobe', 'creative', 'responsive'],
    requiredSections: ['experience', 'skills'],
    commonSkills: ['figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'invision', 'prototyping', 'wireframing', 'user research', 'usability testing', 'design system', 'html', 'css', 'responsive design', 'accessibility'],
    softSkills: ['creativity', 'empathy', 'communication', 'collaboration', 'attention to detail', 'problem solving'],
    educationKeywords: ['design', 'graphic design', 'interaction design', 'hci', 'visual communication', 'fine arts'],
  },
  'marketing': {
    keywords: ['marketing', 'campaign', 'social media', 'content', 'seo', 'sem', 'brand', 'digital', 'email', 'analytics', 'google ads', 'facebook ads', 'strategy', 'lead generation', 'conversion', 'engagement', 'branding', 'copywriting'],
    requiredSections: ['experience', 'skills'],
    commonSkills: ['google analytics', 'google ads', 'facebook ads', 'seo', 'sem', 'mailchimp', 'hubspot', 'wordpress', 'canva', 'adobe', 'social media', 'content marketing', 'email marketing', 'copywriting', 'marketing automation'],
    softSkills: ['creativity', 'communication', 'analytical', 'strategic thinking', 'adaptability', 'collaboration'],
    educationKeywords: ['marketing', 'business', 'communications', 'advertising', 'mba'],
  },
  'business analyst': {
    keywords: ['business', 'analyst', 'requirements', 'stakeholder', 'process', 'workflow', 'documentation', 'use case', 'user story', 'jira', 'confluence', 'gap analysis', 'data', 'reporting', 'dashboard', 'kpi', 'process improvement'],
    requiredSections: ['experience', 'skills', 'education'],
    commonSkills: ['sql', 'excel', 'tableau', 'power bi', 'jira', 'confluence', 'visio', 'process modeling', 'requirements gathering', 'user stories', 'use cases', 'gap analysis', 'stakeholder management'],
    softSkills: ['communication', 'analytical', 'problem solving', 'negotiation', 'presentation', 'critical thinking'],
    educationKeywords: ['business', 'mba', 'management', 'information systems', 'finance', 'economics'],
  },
  'devops engineer': {
    keywords: ['devops', 'ci/cd', 'jenkins', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'monitoring', 'prometheus', 'grafana', 'automation', 'pipeline', 'deployment', 'infrastructure', 'cloud', 'linux', 'scripting'],
    requiredSections: ['experience', 'skills'],
    commonSkills: ['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'aws', 'azure', 'gcp', 'linux', 'bash', 'python', 'prometheus', 'grafana', 'elk', 'git', 'ci/cd', 'helm', 'nginx'],
    softSkills: ['problem solving', 'collaboration', 'communication', 'automation mindset', 'attention to detail'],
    educationKeywords: ['computer science', 'engineering', 'information technology'],
  },
};

const GENERIC_PROFILE: JobRoleProfile = {
  keywords: ['experience', 'skills', 'education', 'project', 'team', 'leadership', 'achievement', 'responsibility', 'communication', 'problem solving'],
  requiredSections: ['experience', 'skills', 'education'],
  commonSkills: ['communication', 'teamwork', 'leadership', 'problem solving', 'microsoft office', 'project management', 'time management'],
  softSkills: ['communication', 'teamwork', 'leadership', 'problem solving', 'adaptability'],
  educationKeywords: ['degree', 'university', 'college', 'bachelor', 'master'],
};

function getRoleProfile(jobRole: string): JobRoleProfile {
  const normalized = jobRole.toLowerCase().trim();
  for (const [key, profile] of Object.entries(JOB_ROLE_PROFILES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return profile;
    }
  }
  return GENERIC_PROFILE;
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractSections(text: string): Record<string, string[]> {
  const normalized = normalizeText(text);
  const sections: Record<string, string[]> = {};

  const sectionPatterns: Record<string, RegExp> = {
    experience: /(?:work\s+experience|professional\s+experience|employment|experience|work\s+history|career)\s*[:\-]?(.*?)(?=(?:education|skills|projects|certifications|achievements|summary|objective|$))/is,
    education: /(?:education|academic|qualifications)\s*[:\-]?(.*?)(?=(?:experience|skills|projects|certifications|achievements|summary|objective|$))/is,
    skills: /(?:skills|technical\s+skills|core\s+skills|key\s+skills|competencies)\s*[:\-]?(.*?)(?=(?:experience|education|projects|certifications|achievements|summary|objective|$))/is,
    projects: /(?:projects|personal\s+projects|key\s+projects)\s*[:\-]?(.*?)(?=(?:experience|education|skills|certifications|achievements|summary|objective|$))/is,
    summary: /(?:summary|objective|profile|about\s+me|professional\s+summary)\s*[:\-]?(.*?)(?=(?:experience|education|skills|projects|certifications|achievements|$))/is,
    certifications: /(?:certifications?|certificates?|licenses?)\s*[:\-]?(.*?)(?=(?:experience|education|skills|projects|achievements|summary|objective|$))/is,
    achievements: /(?:achievements?|awards?|honors?|accomplishments?)\s*[:\-]?(.*?)(?=(?:experience|education|skills|projects|certifications|summary|objective|$))/is,
  };

  for (const [name, pattern] of Object.entries(sectionPatterns)) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      sections[name] = match[1].split('\n').map((s) => s.trim()).filter((s) => s.length > 2);
    }
  }

  if (sections.experience === undefined && /(\d{4}\s*[-–—]\s*(?:\d{4}|present|current))/.test(normalized)) {
    sections.experience = ['detected'];
  }

  return sections;
}

function extractEmail(text: string): string | null {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);
  return match ? match[0] : null;
}

function extractName(text: string): string | null {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(firstLine)) {
      return firstLine;
    }
  }
  return null;
}

export function analyzeResume(resumeText: string, jobRole: string): AnalysisResult {
  const profile = getRoleProfile(jobRole);
  const normalized = normalizeText(resumeText);
  const sections = extractSections(resumeText);
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missingElements: string[] = [];
  const recommendations: string[] = [];
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  // Check contact info
  const hasEmail = !!extractEmail(resumeText);
  const hasPhone = !!extractPhone(resumeText);
  const hasName = !!extractName(resumeText);

  if (hasEmail) strengths.push('Email address is present for contact');
  else { missingElements.push('Email address'); weaknesses.push('No email address found - recruiters need a way to contact you'); }

  if (hasPhone) strengths.push('Phone number is present for contact');
  else { missingElements.push('Phone number'); weaknesses.push('No phone number found - recruiters need a way to reach you'); }

  if (hasName) strengths.push('Name is clearly displayed at the top');
  else { missingElements.push('Full name'); weaknesses.push('Name is not clearly identifiable at the top of the resume'); }

  // Check word count
  if (wordCount < 150) {
    weaknesses.push(`Resume is very short (${wordCount} words) - most professional resumes have 300-800 words`);
    recommendations.push('Add more detail about your experience, skills, and achievements to make your resume more comprehensive');
  } else if (wordCount > 1200) {
    weaknesses.push(`Resume is quite long (${wordCount} words) - consider keeping it to 1-2 pages`);
    recommendations.push('Trim less relevant content to keep your resume concise and focused');
  } else {
    strengths.push(`Resume has a good length (${wordCount} words)`);
  }

  // Check sections
  const hasSummary = !!sections.summary;
  const hasExperience = !!sections.experience;
  const hasEducation = !!sections.education;
  const hasSkills = !!sections.skills;
  const hasProjects = !!sections.projects;
  const hasCertifications = !!sections.certifications;
  const hasAchievements = !!sections.achievements;

  if (hasSummary) strengths.push('Professional summary/objective is present');
  else { missingElements.push('Professional summary or objective'); weaknesses.push('No professional summary found - a summary helps recruiters quickly understand your profile'); recommendations.push('Add a 2-3 line professional summary at the top highlighting your experience and career goals'); }

  if (hasExperience) strengths.push('Work experience section is present');
  else { missingElements.push('Work experience section'); weaknesses.push('No clear work experience section found - this is the most important part of your resume'); recommendations.push('Add a dedicated work experience section listing your roles, companies, dates, and key responsibilities'); }

  if (hasEducation) strengths.push('Education section is present');
  else { missingElements.push('Education section'); weaknesses.push('No education section found'); recommendations.push('Add your educational qualifications including degree, institution, and graduation year'); }

  if (hasSkills) strengths.push('Skills section is present');
  else { missingElements.push('Skills section'); weaknesses.push('No dedicated skills section found'); recommendations.push('Add a skills section listing your technical and soft skills relevant to the job'); }

  if (hasProjects) strengths.push('Projects section is present - great for showcasing practical work');
  else { missingElements.push('Projects section'); recommendations.push('Consider adding a projects section to showcase practical work and hands-on experience'); }

  if (hasAchievements) strengths.push('Achievements section is present - this helps you stand out');
  else { missingElements.push('Achievements section'); recommendations.push('Add an achievements section to highlight awards, recognitions, and notable accomplishments'); }

  if (hasCertifications) strengths.push('Certifications are listed - shows continuous learning');
  else { missingElements.push('Certifications'); recommendations.push('Add any relevant certifications to demonstrate your commitment to professional development'); }

  // Keyword matching
  for (const keyword of profile.keywords) {
    if (normalized.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  // Check for common skills for the role
  for (const skill of profile.commonSkills) {
    if (normalized.includes(skill.toLowerCase())) {
      if (!foundKeywords.includes(skill)) foundKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  }

  // Check for soft skills
  let softSkillCount = 0;
  for (const softSkill of profile.softSkills) {
    if (normalized.includes(softSkill)) {
      softSkillCount++;
    }
  }
  if (softSkillCount >= 3) {
    strengths.push('Good range of soft skills mentioned');
  } else if (softSkillCount > 0) {
    weaknesses.push('Limited soft skills mentioned - employers look for well-rounded candidates');
    recommendations.push(`Highlight soft skills like ${profile.softSkills.slice(0, 3).join(', ')} in your experience descriptions`);
  } else {
    weaknesses.push('No soft skills detected - employers value communication, teamwork, and leadership');
    recommendations.push(`Incorporate soft skills such as ${profile.softSkills.slice(0, 3).join(', ')} into your experience bullet points`);
  }

  // Check for action verbs
  const actionVerbs = ['led', 'managed', 'created', 'developed', 'built', 'designed', 'implemented', 'launched', 'improved', 'increased', 'reduced', 'optimized', 'achieved', 'delivered', 'spearheaded', 'orchestrated', 'streamlined', 'automated', 'established', 'coordinated'];
  const actionVerbCount = actionVerbs.filter((v) => normalized.includes(v)).length;
  if (actionVerbCount >= 5) {
    strengths.push('Strong use of action verbs in experience descriptions');
  } else if (actionVerbCount >= 2) {
    weaknesses.push('Could use more strong action verbs in experience descriptions');
    recommendations.push('Start bullet points with strong action verbs like "Led", "Developed", "Achieved", "Improved" to make your impact clear');
  } else {
    weaknesses.push('Experience descriptions lack strong action verbs');
    recommendations.push('Use strong action verbs (Led, Developed, Built, Improved, Achieved) to start your experience bullet points');
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+\s*(?:users|customers|clients|projects|team|people|hours|days|months|years|revenue|sales|cost|increase|decrease|reduction)/i.test(resumeText);
  if (hasNumbers) {
    strengths.push('Includes quantifiable achievements with metrics and numbers');
  } else {
    weaknesses.push('No quantifiable achievements found - numbers make your impact tangible');
    recommendations.push('Add metrics to your achievements (e.g., "Increased sales by 25%", "Managed a team of 10", "Reduced processing time by 40%")');
  }

  // Check for dates in experience
  const hasDates = /(\d{4}\s*[-–—]\s*(?:\d{4}|present|current|now))|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*\d{4}/i.test(resumeText);
  if (hasDates) {
    strengths.push('Employment dates are included');
  } else {
    weaknesses.push('No clear employment dates found - dates help show career progression');
    recommendations.push('Include start and end dates (month/year) for each position in your experience section');
  }

  // Check for education keywords relevant to the role
  if (hasEducation) {
    const educationText = (sections.education || []).join(' ').toLowerCase();
    const hasRelevantEducation = profile.educationKeywords.some((kw) => educationText.includes(kw));
    if (hasRelevantEducation) {
      strengths.push('Education background is relevant to the job role');
    }
  }

  // ATS compatibility checks
  let atsScore = 10;
  const atsNotes: string[] = [];

  // Check for tables/columns (common ATS blocker) - hard to detect from text, so check for pipe chars
  if (/\|.*\|/.test(resumeText)) {
    atsScore -= 2;
    atsNotes.push('Resume may contain tables or columns which can confuse ATS systems');
  }

  // Check for standard section headers
  const standardHeaders = ['experience', 'education', 'skills'];
  const missingHeaders = standardHeaders.filter((h) => !sections[h]);
  if (missingHeaders.length > 0) {
    atsScore -= missingHeaders.length * 2;
    atsNotes.push(`Missing standard section headers: ${missingHeaders.join(', ')}`);
  }

  // Check for contact info (ATS needs this)
  if (!hasEmail || !hasPhone) {
    atsScore -= 2;
    atsNotes.push('Missing contact information - ATS systems need email and phone');
  }

  // Check for keywords relevant to the role
  const keywordMatchRatio = profile.keywords.length > 0 ? foundKeywords.length / profile.keywords.length : 0;
  if (keywordMatchRatio < 0.2) {
    atsScore -= 3;
    atsNotes.push('Low keyword match - ATS systems filter resumes by keyword relevance');
  } else if (keywordMatchRatio < 0.4) {
    atsScore -= 1;
    atsNotes.push('Moderate keyword match - more role-specific keywords would help');
  } else {
    atsNotes.push('Good keyword density for ATS parsing');
  }

  atsScore = Math.max(1, Math.min(10, atsScore));

  // Calculate overall score
  let score = 0;
  const maxScore = 10;

  // Contact info (1.5 points)
  if (hasEmail) score += 0.5;
  if (hasPhone) score += 0.5;
  if (hasName) score += 0.5;

  // Sections (3 points)
  if (hasSummary) score += 0.5;
  if (hasExperience) score += 1.0;
  if (hasEducation) score += 0.5;
  if (hasSkills) score += 0.5;
  if (hasProjects) score += 0.25;
  if (hasAchievements) score += 0.25;

  // Keyword match (2 points)
  score += Math.min(2, keywordMatchRatio * 2);

  // Quality indicators (2 points)
  if (actionVerbCount >= 5) score += 0.5;
  else if (actionVerbCount >= 2) score += 0.25;
  if (hasNumbers) score += 0.5;
  if (hasDates) score += 0.5;
  if (softSkillCount >= 3) score += 0.5;
  else if (softSkillCount >= 1) score += 0.25;

  // Length (1.5 points)
  if (wordCount >= 300 && wordCount <= 800) score += 1.5;
  else if (wordCount >= 150 && wordCount <= 1200) score += 1.0;
  else if (wordCount >= 50) score += 0.5;

  score = Math.max(1, Math.min(10, Math.round(score)));

  // Generate verdict
  let verdict: string;
  if (score >= 8) {
    verdict = `You created a superb resume that suits your job role! Your resume is well-structured and highly relevant for a ${jobRole} position.`;
  } else if (score >= 6) {
    verdict = `Good resume! It suits the ${jobRole} role well, but there's room for improvement to make it stand out more.`;
  } else if (score >= 4) {
    verdict = `Your resume partially matches the ${jobRole} role. Several improvements are needed to make it more competitive.`;
  } else {
    verdict = `Your resume needs significant improvements to match the ${jobRole} role. Follow the recommendations below to strengthen it.`;
  }

  // Add keyword-specific recommendations
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 5);
    recommendations.push(`Add these relevant keywords to your resume: ${topMissing.join(', ')}`);
  }

  if (foundKeywords.length > 0) {
    strengths.push(`Contains ${foundKeywords.length} keywords relevant to ${jobRole}`);
  }

  return {
    score,
    verdict,
    strengths,
    weaknesses,
    missingElements,
    recommendations,
    atsCompatibility: {
      score: atsScore,
      notes: atsNotes.join('. ') || 'Resume appears ATS-friendly with standard formatting',
    },
    keywordMatch: {
      found: foundKeywords.slice(0, 15),
      missing: missingKeywords.slice(0, 10),
    },
  };
}
