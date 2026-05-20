/**
 * Same logic as src/Hooks/api/firestoreSearch.js — keep in sync when changing rules.
 */
function buildSearchKeywordsFromName(name) {
  const lower = String(name ?? "")
    .trim()
    .toLowerCase();
  if (!lower) return [];

  const set = new Set([lower]);
  const words = lower.split(/\s+/).filter(Boolean);

  for (const word of words) {
    set.add(word);
    for (let i = 2; i <= word.length; i++) {
      set.add(word.slice(0, i));
    }
    for (let i = 0; i < word.length; i++) {
      for (let len = 2; len <= word.length - i; len++) {
        set.add(word.slice(i, i + len));
      }
    }
  }

  return Array.from(set);
}

function resolveDisplayName(data) {
  if (typeof data?.name === "string" && data.name.trim() !== "") {
    return data.name.trim();
  }
  if (typeof data?.title === "string" && data.title.trim() !== "") {
    return data.title.trim();
  }
  if (typeof data?.title?.rendered === "string" && data.title.rendered.trim() !== "") {
    return data.title.rendered.trim();
  }
  if (typeof data?.titleRendered === "string" && data.titleRendered.trim() !== "") {
    return data.titleRendered.trim();
  }
  return "";
}

module.exports = { buildSearchKeywordsFromName, resolveDisplayName };
