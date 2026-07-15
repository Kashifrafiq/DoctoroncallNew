import {
  collection,
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
  let snap = await getDocs(query(col, where('categoryId', '==', categoryId)));
  if (!snap.empty) {
    return snap.docs;
  }

  if (typeof categoryId === 'number') {
    snap = await getDocs(query(col, where('categoryId', '==', String(categoryId))));
    if (!snap.empty) {
      return snap.docs;
    }
  } else if (
    typeof categoryId === 'string' &&
    categoryId.trim() !== '' &&
    !Number.isNaN(Number(categoryId))
  ) {
    snap = await getDocs(query(col, where('categoryId', '==', Number(categoryId))));
    if (!snap.empty) {
      return snap.docs;
    }
  }

  return [];
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
