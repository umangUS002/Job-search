export function detectLevel(title) {

  if (!title) return "Mid";

  const t = title.toLowerCase();

  if (t.includes("intern")) return "Intern";
  if (t.includes("junior")) return "Junior";
  if (t.includes("senior")) return "Senior";
  if (t.includes("lead")) return "Lead";

  return "Mid";
}

export function isIndiaJob(location) {
  if (!location) return false;
  const loc = location.toLowerCase();
  
  // Direct match for India or major Indian cities/tech hubs (onsite, hybrid, or remote in India)
  const hasIndia = loc.includes("india") || 
                   loc.includes("bangalore") || 
                   loc.includes("bengaluru") || 
                   loc.includes("mumbai") || 
                   loc.includes("pune") || 
                   loc.includes("delhi") || 
                   loc.includes("gurgaon") || 
                   loc.includes("gurugram") || 
                   loc.includes("noida") || 
                   loc.includes("hyderabad") || 
                   loc.includes("chennai") || 
                   loc.includes("kolkata") || 
                   loc.includes("kochi") || 
                   loc.includes("ahmedabad");
  
  return hasIndia;
}

export function isEngineeringAndJuniorJob(title) {
  if (!title) return false;
  const t = title.toLowerCase();

  // 1. Allowed engineering and tech terms (Junior, Mid, Senior, Lead, Architect, and Manager levels are all allowed)
  const allowedTechTerms = [
    "software", "engineer", "developer", "sde", "frontend", "backend", "full stack", 
    "full-stack", "web", "android", "ios", "mobile", "app", "qa", "test", "testing",
    "data scientist", "data science", "data analyst", "machine learning", "ml", "ai",
    "cloud", "devops", "systems", "cyber", "security", "database", "sql", "javascript",
    "python", "react", "node", "java", "golang", "c++", "compiler", "embedded",
    "product analyst", "data specialist", "applied scientist", "science", "architect"
  ];
  
  const isTechRole = allowedTechTerms.some(term => t.includes(term)) || 
                     t.includes("intern") || 
                     t.includes("internship") || 
                     t.includes("trainee") || 
                     t.includes("co-op");

  // 2. Exclude non-engineering domains (like HR, Sales, Copy Writers, Customer Support)
  const excludedDomains = [
    "sales", "marketing", "content writer", "copy writer", "video editor", "graphic designer", 
    "compliance", "legal", "hr", "recruiter", "talent", "billing", "finance", "accountant", 
    "controllership", "procurement", "operations", "customer support", "customer success",
    "customer experience", "medical", "nurse", "salesforce admin"
  ];
  const isExcluded = excludedDomains.some(domain => t.includes(domain));

  if (isExcluded) {
    return false;
  }

  return isTechRole;
}

export function extractSalary(description, title) {
  if (!description) return undefined;

  // 1. Search for LPA/Lakhs ranges (typical in Indian job posts)
  // e.g., "12 LPA - 18 LPA", "10-15 LPA", "8 to 12 Lakhs"
  const lpaRange = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*LPA/i;
  const lakhsRange = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*lakh/i;
  const lpaSingle = /(\d+(?:\.\d+)?)\s*LPA/i;

  let match = description.match(lpaRange);
  if (match) {
    const avg = (parseFloat(match[1]) + parseFloat(match[2])) / 2;
    return Math.round(avg * 100000); // convert LPA to raw value
  }

  match = description.match(lakhsRange);
  if (match) {
    const avg = (parseFloat(match[1]) + parseFloat(match[2])) / 2;
    return Math.round(avg * 100000);
  }

  match = description.match(lpaSingle);
  if (match) {
    return Math.round(parseFloat(match[1]) * 100000);
  }

  // 2. Search for USD ranges (e.g. "$80,000 - $120,000" or "$100k - $150k")
  const usdRange = /\$\s*(\d{2,3}),?000\s*(?:-|to)\s*\$\s*(\d{2,3}),?000/i;
  const usdKRange = /\$\s*(\d{2,3})k\s*(?:-|to)\s*\$\s*(\d{2,3})k/i;

  match = description.match(usdRange);
  if (match) {
    const avg = (parseFloat(match[1]) + parseFloat(match[2])) / 2;
    return Math.round(avg * 1000);
  }

  match = description.match(usdKRange);
  if (match) {
    const avg = (parseFloat(match[1]) + parseFloat(match[2])) / 2;
    return Math.round(avg * 1000);
  }

  return undefined;
}