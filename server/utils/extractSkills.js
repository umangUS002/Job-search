import { SKILLS } from "./skills.js";

export function extractSkills(text) {

  if (!text) return [];

  const foundSkills = [];

  const lowerText = text.toLowerCase();

  for (const skill of SKILLS) {

    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }

  }

  return foundSkills;
}