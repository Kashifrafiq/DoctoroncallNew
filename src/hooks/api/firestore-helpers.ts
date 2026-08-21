import {
  collection,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { firestore, isFirebaseReady } from '@/config/firebase';
import type { CategoryItem } from '@/types/catalog';

export function getFirestoreDb() {
  if (!isFirebaseReady || !firestore) {
    return null;
  }

  return firestore;
}

export async function getCollectionSnapshot(
  collectionName: string,
): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]> {
  const db = getFirestoreDb();
  if (!db) {
    return [];
  }

  const collectionRef = collection(db, collectionName);

  try {
    const snap = await getDocsFromServer(collectionRef);
    return snap.docs;
  } catch (error) {
    console.warn(
      `Server fetch failed for ${collectionName}, falling back to cache/default source`,
      error,
    );
    const snap = await getDocs(collectionRef);
    return snap.docs;
  }
}

/** Fetch a single doc by Firestore document id, then by `id` field. */
export async function fetchDocById(
  collectionName: string,
  id: string | number,
): Promise<QueryDocumentSnapshot<DocumentData, DocumentData> | null> {
  if (id === undefined || id === null || id === '') {
    return null;
  }

  const db = getFirestoreDb();
  if (!db) {
    return null;
  }

  const idString = String(id);
  const col = collection(db, collectionName);

  try {
    const byDocId = await getDoc(doc(db, collectionName, idString));
    if (byDocId.exists()) {
      return byDocId as QueryDocumentSnapshot<DocumentData, DocumentData>;
    }
  } catch (error) {
    console.warn(`getDoc failed for ${collectionName}/${idString}`, error);
  }

  for (const candidate of [idString, Number.isNaN(Number(idString)) ? null : Number(idString)]) {
    if (candidate == null || candidate === '') {
      continue;
    }
    try {
      const snap = await getDocs(query(col, where('id', '==', candidate)));
      if (!snap.empty) {
        return snap.docs[0];
      }
    } catch (error) {
      console.warn(`id-field query failed for ${collectionName}`, error);
    }
  }

  return null;
}

/** Primary categoryId first, then categoryIds / legacy arrays (deduped). */
export function resolveMembershipCategoryIds(
  categoryId: unknown,
  categoryIds: unknown,
  legacyArray?: unknown,
): (string | number)[] {
  const result: (string | number)[] = [];
  const seen = new Set<string>();

  const push = (value: unknown) => {
    if (value == null || value === '') {
      return;
    }
    if (typeof value !== 'string' && typeof value !== 'number') {
      return;
    }
    const key = String(value);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(value);
  };

  push(categoryId);
  if (Array.isArray(categoryIds)) {
    categoryIds.forEach(push);
  }
  if (Array.isArray(legacyArray)) {
    legacyArray.forEach(push);
  }

  return result;
}

function categoryIdQueryVariants(categoryId: string | number): (string | number)[] {
  const variants: (string | number)[] = [categoryId];

  if (typeof categoryId === 'number') {
    variants.push(String(categoryId));
  } else if (
    typeof categoryId === 'string' &&
    categoryId.trim() !== '' &&
    !Number.isNaN(Number(categoryId))
  ) {
    variants.push(Number(categoryId));
  }

  return variants;
}

/**
 * Loads docs where this category is the primary `categoryId` OR appears in `categoryIds`.
 * Results are deduped by document id.
 */
export async function fetchDocsByCategoryId(
  collectionName: string,
  categoryId: string | number,
): Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]> {
  if (categoryId === undefined || categoryId === null || categoryId === '') {
    return [];
  }

  const db = getFirestoreDb();
  if (!db) {
    return [];
  }

  const col = collection(db, collectionName);
  const byDocId = new Map<string, QueryDocumentSnapshot<DocumentData, DocumentData>>();

  for (const candidate of categoryIdQueryVariants(categoryId)) {
    const [primarySnap, membershipSnap] = await Promise.all([
      getDocs(query(col, where('categoryId', '==', candidate))),
      getDocs(query(col, where('categoryIds', 'array-contains', candidate))),
    ]);

    for (const doc of primarySnap.docs) {
      byDocId.set(doc.id, doc);
    }
    for (const doc of membershipSnap.docs) {
      byDocId.set(doc.id, doc);
    }
  }

  return Array.from(byDocId.values());
}

export function mapCategoryDoc(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): CategoryItem {
  const data = doc.data() || {};
  const id = data.id != null ? data.id : doc.id;

  return {
    ...data,
    id,
    name: data.name ?? data.title?.rendered ?? '',
    count: data.count ?? data.medicineCount ?? 0,
    color: data.color ?? '#1CA4DD',
    imageUrl: data.imageUrl ?? data.acf?.category_image ?? null,
    acf: data.acf ?? {},
  };
}
