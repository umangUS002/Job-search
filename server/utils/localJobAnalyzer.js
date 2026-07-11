const COMMON_SKILLS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "golang", "ruby", "rust", "php", "swift", "kotlin", "scala",
  "html", "css", "sass", "tailwind", "react", "next.js", "angular", "vue", "svelte", "jquery", "bootstrap",
  "node", "express", "django", "flask", "fastapi", "spring boot", "rails", "laravel", "asp.net",
  "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "sqlite", "mariadb", "cassandra", "dynamodb",
  "docker", "kubernetes", "aws", "gcp", "azure", "firebase", "jenkins", "git", "github", "gitlab", "bitbucket",
  "graphql", "rest api", "grpc", "websockets", "microservices", "serverless",
  "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
  "data science", "data analysis", "pandas", "numpy", "tableau", "power bi", "hadoop", "spark",
  "ci/cd", "devops", "linux", "bash", "shell", "nginx", "apache", "terraform", "ansible",
  "jest", "mocha", "cypress", "selenium", "playwright", "testing", "qa",
  "agile", "scrum", "jira", "confluence", "system design", "data structures", "algorithms"
];

export function analyzeJobLocally(resumeData, job) {
  const resumeSkills = (resumeData?.skills || []).map(s => s.toLowerCase());
  const jobText = `${job.title} ${job.description}`.toLowerCase();

  // 1. Identify skills required by the job
  const jobSkills = [];
  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(jobText)) {
      jobSkills.push(skill);
    }
  }

  // Also include explicitly tagged skills in Job.skills
  if (Array.isArray(job.skills)) {
    for (const skill of job.skills) {
      const lower = skill.toLowerCase();
      if (!jobSkills.includes(lower)) {
        jobSkills.push(lower);
      }
    }
  }

  // 2. Compute missing skills
  const missingSkills = jobSkills
    .filter(skill => !resumeSkills.includes(skill))
    .map(s => s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));

  // 3. Compute matchScore
  const titleKeywords = ["software", "developer", "engineer", "frontend", "backend", "full", "stack", "intern", "sde", "data", "analyst", "applied", "science", "coder", "programmer", "architect", "tech", "technology"];
  const titleLower = job.title.toLowerCase();
  const isTechRole = titleKeywords.some(kw => titleLower.includes(kw));

  let matchScore = 15; // Base score (starts low)

  if (jobSkills.length > 0) {
    const matchedCount = jobSkills.length - missingSkills.length;
    const skillMatchPercentage = matchedCount / jobSkills.length;
    matchScore += Math.round(skillMatchPercentage * 65); // Up to 65% from skills
  } else {
    // If no specific skills are found in the description, give a minor base tech bonus if it's a tech role
    if (isTechRole) {
      matchScore += 20;
    }
  }

  // Title keyword alignment bonus (up to 20 points)
  let titleBonus = 0;
  if (isTechRole) {
    for (const kw of titleKeywords) {
      if (titleLower.includes(kw)) {
        const expHas = (resumeData?.experience || []).some(exp => exp.role.toLowerCase().includes(kw));
        const projHas = (resumeData?.projects || []).some(proj => proj.title.toLowerCase().includes(kw) || proj.description.toLowerCase().includes(kw));
        if (expHas || projHas) {
          titleBonus += 5; // Add 5 points per keyword match
        }
      }
    }
  }
  matchScore = Math.min(Math.round(matchScore + titleBonus), 100);

  // If it's a completely non-technical role (e.g. Designer, HR, Sales) and candidate resume is SDE
  if (!isTechRole) {
    matchScore = Math.min(matchScore, 15); // Severe penalty for non-tech roles
  }

  // 4. Compute atsScore
  let atsScore = 70; // Good base formatting score
  if (resumeData?.skills?.length > 5) atsScore += 5;
  if (resumeData?.projects?.length > 0) atsScore += 10;
  if (resumeData?.experience?.length > 0) atsScore += 10;
  if (resumeData?.education?.length > 0) atsScore += 5;
  atsScore = Math.min(atsScore, 100);

  // 5. Generate concise job summary
  const summary = `This is a ${job.level || "Mid-level"} ${job.title} role located in ${job.location || "Remote"}. The position requires experience in ${jobSkills.length > 0 ? jobSkills.slice(0, 3).join(", ") : "software engineering and tech stacks"}.`;

  // 6. Generate gap analysis text
  let skillGapAnalysis = "";
  if (missingSkills.length === 0) {
    skillGapAnalysis = "Excellent alignment! Your profile features all of the key technologies requested in this job description. You are highly competitive for this role.";
  } else {
    const gapList = missingSkills.slice(0, 4).join(", ");
    skillGapAnalysis = `Your background is strong, but you have a skill gap in: ${gapList}. To increase your compatibility, we suggest building a project implementing these technologies and adding them to your resume.`;
  }

  return {
    matchScore,
    atsScore,
    missingSkills,
    summary,
    skillGapAnalysis
  };
}
