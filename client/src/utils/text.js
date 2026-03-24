import he from "he";

export const getShortDescription = (desc, length = 150) => {
  return he
    .decode(desc || "")
    .replace(/<[^>]+>/g, "")
    .slice(0, length);
};