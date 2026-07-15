import {
  collection,
  getDocs,
  limit,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/hooks/api/firestore-helpers';

const PREFIX_END = '\uf8ff';

export const MIN_SEARCH_LENGTH = 2;
export const SEARCH_RESULT_LIMIT = 25;

export function buildSearchKeywordsFromName(name: string): string[] {
  const lower = String(name ?? '')
    .trim()
    .toLowerCase();
  if (!lower) {
    return [];
  }

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

function getItemDisplayName(item: { name?: string; title?: { rendered?: string } }): string {
  return String(item?.name ?? item?.title?.rendered ?? '').toLowerCase();
}

function mergeDocs(
  lists: QueryDocumentSnapshot<DocumentData, DocumentData>[][],
  cap: number,
): QueryDocumentSnapshot<DocumentData, DocumentData>[] {
  const seen = new Set<string>();
  const out: QueryDocumentSnapshot<DocumentData, DocumentData>[] = [];

  for (const docs of lists) {
    for (const doc of docs) {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        out.push(doc);
        if (out.length >= cap) {
          return out;
        }
      }
    }
  }

  return out;
}

async function prefixQuery(
  col: ReturnType<typeof collection>,
  field: string,
  prefix: string,
  resultLimit: number,
): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]> {
  if (!prefix) {
    return [];
  }

  const end = prefix + PREFIX_END;

  try {
    const snap = await getDocs(
      query(col, where(field, '>=', prefix), where(field, '<=', end), limit(resultLimit)),
    );
    return snap.docs;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Prefix search failed (${field}="${prefix}"):`, message);
    return [];
  }
}

async function keywordQuery(
  col: ReturnType<typeof collection>,
  term: string,
  resultLimit: number,
): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]> {
  try {
    const snap = await getDocs(
      query(col, where('searchKeywords', 'array-contains', term), limit(resultLimit)),
    );
    return snap.docs;
  } catch {
    return [];
  }
}

export async function searchByNamePrefix<T>(
  collectionName: string,
  mapDoc: (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => T,
  rawQuery: string,
  resultLimit = SEARCH_RESULT_LIMIT,
): Promise<T[]> {
  const term = rawQuery.trim().toLowerCase();
  if (term.length < MIN_SEARCH_LENGTH) {
    return [];
  }

  const db = getFirestoreDb();
  if (!db) {
    return [];
  }

  const titleCasePrefix = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
  const col = collection(db, collectionName);

  const docLists = await Promise.all([
    prefixQuery(col, 'nameLower', term, resultLimit),
    prefixQuery(col, 'name', term, resultLimit),
    prefixQuery(col, 'name', titleCasePrefix, resultLimit),
    keywordQuery(col, term, resultLimit),
  ]);

  const docs = mergeDocs(docLists, resultLimit);

  return docs
    .map(mapDoc)
    .filter((item) =>
      getItemDisplayName(item as { name?: string; title?: { rendered?: string } }).includes(term),
    )
    .slice(0, resultLimit);
}
