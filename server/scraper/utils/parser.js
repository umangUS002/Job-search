export function detectLevel(title) {

  if (!title) return "Mid";

  const t = title.toLowerCase();

  if (t.includes("intern")) return "Intern";
  if (t.includes("junior")) return "Junior";
  if (t.includes("senior")) return "Senior";
  if (t.includes("lead")) return "Lead";

  return "Mid";
}