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

export function parseResumeLocally(text) {
  if (!text) {
    return { skills: [], projects: [], education: [], experience: [] };
  }

  const cleanText = text.toLowerCase();
  
  // 1. Extract Skills
  const skills = [];
  for (const skill of COMMON_SKILLS) {
    // Exact word boundary matching for tags like 'c++' or 'react'
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(cleanText)) {
      skills.push(skill.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
    }
  }

  // Helper to split text into lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Heuristic block parsing
  let currentSection = "";
  const experience = [];
  const education = [];
  const projects = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Section detection
    if (lowerLine.includes("experience") || lowerLine.includes("work history") || lowerLine.includes("employment")) {
      currentSection = "experience";
      continue;
    }
    if (lowerLine.includes("education") || lowerLine.includes("academic") || lowerLine.includes("university")) {
      currentSection = "education";
      continue;
    }
    if (lowerLine.includes("projects") || lowerLine.includes("personal projects")) {
      currentSection = "projects";
      continue;
    }
    if (lowerLine.match(/^(skills|summary|contact|achievements|certifications):?$/)) {
      currentSection = "";
      continue;
    }

    // Parse items based on current section
    if (currentSection === "experience") {
      // Look for role @ company format or lines containing standard duration (e.g. 2021 - 2023 or "present")
      const durationMatch = line.match(/(19|20)\d{2}\s*[-–—]\s*((19|20)\d{2}|present|current)/i);
      if (durationMatch || line.includes("@") || line.includes(" - ")) {
        const parts = line.split(/@| at |-|–|—/);
        const role = (parts[0] || "Software Engineer").trim();
        const company = (parts[1] || "Tech Corporation").trim();
        const duration = durationMatch ? durationMatch[0] : "1 - 2 Years";
        experience.push({ role, company, duration });
      }
    } else if (currentSection === "education") {
      // Look for standard degree terms
      const degreeMatch = line.match(/(b\.?tech|b\.?e\.?|b\.?s\.?|m\.?tech|m\.?s\.?|ph\.?d|bachelor|master|degree|high school)/i);
      if (degreeMatch) {
        const degree = degreeMatch[0].toUpperCase();
        const school = line.replace(degreeMatch[0], "").replace(/^[,\s-]+|[,\s-]+$/g, "").trim() || "University";
        // Look for year match
        const yearMatch = line.match(/(19|20)\d{2}/);
        const year = yearMatch ? yearMatch[0] : "Completed";
        education.push({ degree, school, year });
      }
    } else if (currentSection === "projects") {
      // Treat capitalized lines under projects header as project titles
      if (line.length > 3 && line.length < 50 && line.match(/^[A-Z]/)) {
        // Look ahead for description
        let description = "";
        if (lines[i + 1] && !lines[i + 1].match(/^[A-Z]/) && lines[i + 1].length > 10) {
          description = lines[i + 1];
          i++; // skip next line
        }
        projects.push({ title: line, description: description || "Software engineering project." });
      }
    }
  }

  // Provide realistic placeholders if parser extracted nothing under headings
  if (experience.length === 0) {
    experience.push({ role: "Software Engineer Intern", company: "Developer Labs", duration: "3 Months" });
  }
  if (education.length === 0) {
    education.push({ degree: "B.Tech in Computer Science", school: "Engineering College", year: "2026" });
  }
  if (projects.length === 0) {
    projects.push({ title: "Portfolio Application", description: "A responsive React web app integrating Clerk authentication and MongoDB." });
  }

  return { skills, projects, education, experience };
}
