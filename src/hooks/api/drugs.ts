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

const COL_MEDICINE_CATEGORIES = 'medicineCategories';
const COL_MEDICINES = 'medicines';
const LEGACY_CACHE_PREFIX = 'drugs_chunk_';

function mapMedicineDoc(doc: QueryDocumentSnapshot<DocumentData, DocumentData>): DiseaseListItem & SearchResultItem {
  const data = doc.data() || {};
  const id = data.id != null ? data.id : doc.id;

  const titleText =
    (typeof data.name === 'string' && data.name.trim() !== '' ? data.name : null) ??
    (typeof data.title === 'string'
      ? data.title
      : (data.title?.rendered ?? data.titleRendered ?? ''));

  const categoryId = data.categoryId;
  const drugCategory = resolveMembershipCategoryIds(
    categoryId,
    data.categoryIds,
    data.drug_category ?? data.drugCategory,
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
    categoryIds: drugCategory,
    type: 'drug',
    drug_category: drugCategory,
  };
}

export async function getdrugsCatogery(): Promise<CategoryItem[]> {
  try {
    const docs = await getCollectionSnapshot(COL_MEDICINE_CATEGORIES);
    return docs.map(mapCategoryDoc);
  } catch (error) {
    console.error('Error fetching medicine categories from Firestore:', error);
    return [];
  }
}

export async function getDrugs(): Promise<DiseaseListItem[]> {
  try {
    const docs = await getCollectionSnapshot(COL_MEDICINES);
    return docs.map(mapMedicineDoc);
  } catch (error) {
    console.error('Error fetching medicines from Firestore:', error);
    return [];
  }
}

export async function getMedicinesByCategoryId(
  categoryId: string | number,
): Promise<DiseaseListItem[]> {
  try {
    const docs = await fetchDocsByCategoryId(COL_MEDICINES, categoryId);
    return docs.map(mapMedicineDoc);
  } catch (error) {
    console.error('Error fetching medicines by categoryId:', error);
    return [];
  }
}

export async function getMedicineById(id: string | number): Promise<DiseaseListItem | null> {
  try {
    const docSnap = await fetchDocById(COL_MEDICINES, id);
    return docSnap ? mapMedicineDoc(docSnap) : null;
  } catch (error) {
    console.error('Error fetching medicine by id:', error);
    return null;
  }
}

export async function searchMedicines(queryTerm: string): Promise<SearchResultItem[]> {
  return searchByNamePrefix(COL_MEDICINES, mapMedicineDoc, queryTerm);
}

export async function clearDrugsCache(): Promise<boolean> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(LEGACY_CACHE_PREFIX));
    if (cacheKeys.length) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
    return true;
  } catch (error) {
    console.error('Error clearing drugs cache keys:', error);
    return false;
  }
}

export async function getDrugsCacheInfo(): Promise<null> {
  return null;
}
