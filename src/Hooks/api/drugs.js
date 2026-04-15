import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { buildContentSectionsForUi } from "../../services/contentSectionMapper";

/** @see Firestore collection — medicine category tiles (Home) */
const COL_MEDICINE_CATEGORIES = "medicineCategories";
/** @see Firestore collection — medicine entries */
const COL_MEDICINES = "medicines";

const LEGACY_CACHE_PREFIX = "drugs_chunk_";

const getCollectionSnapshot = async (collectionName) => {
  const collectionRef = firestore().collection(collectionName);
  try {
    // Always prefer fresh server data so admin/database updates show immediately.
    return await collectionRef.get({ source: "server" });
  } catch (error) {
    console.warn(
      `Server fetch failed for ${collectionName}, falling back to cache/default source`,
      error
    );
    return await collectionRef.get();
  }
};

const fetchDocsByCategoryId = async (collectionName, categoryId) => {
  if (categoryId === undefined || categoryId === null || categoryId === "") {
    return [];
  }
  const col = firestore().collection(collectionName);
  let snap = await col.where("categoryId", "==", categoryId).get();
  if (!snap.empty) return snap.docs;

  if (typeof categoryId === "number") {
    snap = await col.where("categoryId", "==", String(categoryId)).get();
    if (!snap.empty) return snap.docs;
  } else if (
    typeof categoryId === "string" &&
    categoryId.trim() !== "" &&
    !Number.isNaN(Number(categoryId))
  ) {
    snap = await col.where("categoryId", "==", Number(categoryId)).get();
    if (!snap.empty) return snap.docs;
  }

  return [];
};

const mapCategoryDoc = (doc) => {
  const d = doc.data() || {};
  const id = d.id != null ? d.id : doc.id;
  return {
    id,
    name: d.name ?? d.title?.rendered ?? "",
    count: d.count ?? 0,
    acf: d.acf ?? {},
    ...d,
    id,
  };
};

const mapMedicineDoc = (doc) => {
  const d = doc.data() || {};
  const id = d.id != null ? d.id : doc.id;

  const titleText =
    (typeof d.name === "string" && d.name.trim() !== ""
      ? d.name
      : null) ??
    (typeof d.title === "string"
      ? d.title
      : d.title?.rendered ?? d.titleRendered ?? "");

  const categoryId = d.categoryId;
  const fromArray = d.drug_category ?? d.drugCategory;
  const drugCategory = Array.isArray(fromArray)
    ? fromArray
    : categoryId != null
      ? [categoryId]
      : [];

  const { sections, acf } = buildContentSectionsForUi(d);

  return {
    id,
    slug: d.slug ?? String(id),
    title: { rendered: titleText },
    sections,
    shortDescription: d.shortDescription,
    htmlContent: d.htmlContent,
    acf,
    categoryId,
    type: "drug",
    drug_category: drugCategory,
  };
};

export const getdrugsCatogery = async () => {
  try {
    const snap = await getCollectionSnapshot(COL_MEDICINE_CATEGORIES);
    return snap.docs.map(mapCategoryDoc);
  } catch (error) {
    console.error("Error fetching medicine categories from Firestore:", error);
    return [];
  }
};

/** Full medicines collection (e.g. Home search merge, favorites that need all rows). */
export const getDrugs = async () => {
  try {
    const snap = await getCollectionSnapshot(COL_MEDICINES);
    return snap.docs.map(mapMedicineDoc);
  } catch (error) {
    console.error("Error fetching medicines from Firestore:", error);
    return [];
  }
};

/**
 * Only medicines for the opened category (field categoryId on each doc).
 */
export const getMedicinesByCategoryId = async (categoryId) => {
  try {
    const docs = await fetchDocsByCategoryId(COL_MEDICINES, categoryId);
    return docs.map(mapMedicineDoc);
  } catch (error) {
    console.error("Error fetching medicines by categoryId:", error);
    return [];
  }
};

export const clearDrugsCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(LEGACY_CACHE_PREFIX));
    if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error("Error clearing drugs cache keys:", error);
  }
};

export const getDrugsCacheInfo = async () => {
  return null;
};
