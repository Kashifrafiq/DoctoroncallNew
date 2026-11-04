import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

import {
  fetchDocById,
  fetchDocsByCategoryId,
  getCollectionSnapshot,
  mapCategoryDoc,
  resolveMembershipCategoryIds,
} from '@/hooks/api/firestore-helpers';
import { searchByNamePrefix } from '@/hooks/api/firestore-search';
import type { CategoryItem, SearchResultItem } from '@/types/catalog';
import type { DiseaseListItem } from '@/types/disease';
import { buildContentSectionsForUi } from '@/utils/content-sections';

const COL_DISEASE_CATEGORIES = 'diseaseCategories';
const COL_DISEASES = 'diseases';
const LEGACY_CACHE_PREFIX = 'diseases_chunk_';

function mapDiseaseDoc(doc: QueryDocumentSnapshot<DocumentData, DocumentData>): DiseaseListItem & SearchResultItem {
  const data = doc.data() || {};
  const id = data.id != null ? data.id : doc.id;

  const titleText =
    (typeof data.name === 'string' && data.name.trim() !== '' ? data.name : null) ??
    (typeof data.title === 'string'
      ? data.title
      : (data.title?.rendered ?? data.titleRendered ?? ''));

  const categoryId = data.categoryId;
  const diseaseCategory = resolveMembershipCategoryIds(
    categoryId,
    data.categoryIds,
    data['disease-category'] ?? data.diseaseCategory,
  );

  const { sections, acf } = buildContentSectionsForUi(data);

  return {
    id,
    name: titleText,
    slug: data.slug ?? String(id),
    title: { rendered: titleText },
    sections,
    shortDescription: data.shortDescription,
    htmlContent: data.htmlContent,
    acf,
    categoryId,
    categoryIds: diseaseCategory,
    type: 'disease',
    'disease-category': diseaseCategory,
  };
}

export async function getDiseasesCatogery(): Promise<CategoryItem[]> {
  try {
    const docs = await getCollectionSnapshot(COL_DISEASE_CATEGORIES);
    return docs.map(mapCategoryDoc);
  } catch (error) {
    console.error('Error fetching disease categories from Firestore:', error);
    return [];
  }
}

export async function getdiseases(): Promise<DiseaseListItem[]> {
  try {
    const docs = await getCollectionSnapshot(COL_DISEASES);
    return docs.map(mapDiseaseDoc);
  } catch (error) {
    console.error('Error fetching diseases from Firestore:', error);
    return [];
  }
}

export async function getDiseasesByCategoryId(
  categoryId: string | number,
): Promise<DiseaseListItem[]> {
  try {
    const docs = await fetchDocsByCategoryId(COL_DISEASES, categoryId);
    return docs.map(mapDiseaseDoc);
  } catch (error) {
    console.error('Error fetching diseases by categoryId:', error);
    return [];
  }
}

export async function getDiseaseById(id: string | number): Promise<DiseaseListItem | null> {
  try {
    const docSnap = await fetchDocById(COL_DISEASES, id);
    return docSnap ? mapDiseaseDoc(docSnap) : null;
  } catch (error) {
    console.error('Error fetching disease by id:', error);
    return null;
  }
}

export async function searchDiseases(queryTerm: string): Promise<SearchResultItem[]> {
  return searchByNamePrefix(COL_DISEASES, mapDiseaseDoc, queryTerm);
}

export async function clearDiseasesCache(): Promise<boolean> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(LEGACY_CACHE_PREFIX));
    if (cacheKeys.length) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
    return true;
  } catch (error) {
    console.error('Error clearing diseases cache keys:', error);
    return false;
  }
}

export async function getCacheInfo(): Promise<null> {
  return null;
}
