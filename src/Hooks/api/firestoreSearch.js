import firestore from "@react-native-firebase/firestore";

const PREFIX_END = "\uf8ff";
export const MIN_SEARCH_LENGTH = 2;
export const SEARCH_RESULT_LIMIT = 25;

/**
 * Build tokens for Firestore `searchKeywords` so queries like "vu" match "Acne vulgaris".
 * Run this when saving each disease/medicine in admin (or batch-migrate existing docs).
 */
export const buildSearchKeywordsFromName = (name) => {
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
};

const getItemDisplayName = (item) =>
  String(item?.name ?? item?.title?.rendered ?? "").toLowerCase();

const mergeDocs = (lists, cap) => {
  const seen = new Set();
  const out = [];
  for (const docs of lists) {
    for (const doc of docs) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        out.push(doc);
        if (out.length >= cap) return out;
      }
    }
  }
  return out;
};

const prefixQuery = async (col, field, prefix, limit) => {
  if (!prefix) return [];
  const end = prefix + PREFIX_END;
  try {
    const snap = await col
      .where(field, ">=", prefix)
      .where(field, "<=", end)
      .limit(limit)
      .get();
    return snap.docs;
  } catch (error) {
    console.warn(
      `Prefix search failed (${field}="${prefix}"):`,
      error?.message ?? error
    );
    return [];
  }
};

const keywordQuery = async (col, term, limit) => {
  try {
    const snap = await col
      .where("searchKeywords", "array-contains", term)
      .limit(limit)
      .get();
    return snap.docs;
  } catch {
    return [];
  }
};

/**
 * Search diseases/medicines by `name` (and optional index fields).
 * - "ac" → prefix on name / nameLower (e.g. "Acne vulgaris")
 * - "vu" → needs `searchKeywords` containing "vu" (use buildSearchKeywordsFromName)
 */
export const searchByNamePrefix = async (
  collectionName,
  mapDoc,
  rawQuery,
  limit = SEARCH_RESULT_LIMIT
) => {
  const term = rawQuery.trim().toLowerCase();
  if (term.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  const titleCasePrefix =
    term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();

  const col = firestore().collection(collectionName);

  const docLists = await Promise.all([
    prefixQuery(col, "nameLower", term, limit),
    prefixQuery(col, "name", term, limit),
    prefixQuery(col, "name", titleCasePrefix, limit),
    keywordQuery(col, term, limit),
  ]);

  const docs = mergeDocs(docLists, limit);

  return docs
    .map(mapDoc)
    .filter((item) => getItemDisplayName(item).includes(term))
    .slice(0, limit);
};
