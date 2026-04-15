import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { buildContentSectionsForUi } from "../../services/contentSectionMapper";

/** @see Firestore collection — disease category tiles (Home) */
const COL_DISEASE_CATEGORIES = "diseaseCategories";
/** @see Firestore collection — disease entries */
const COL_DISEASES = "diseases";

const LEGACY_CACHE_PREFIX = "diseases_chunk_";

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

/**
 * Query by categoryId; retries with number/string if the first query is empty
 * (Firestore matches types strictly).
 */
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

/**
 * Maps a Firestore category doc to the shape Home / Favorites / Recent expect.
 */
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

/**
 * Maps a Firestore disease doc to the shape ListOfDiseases / NameCard / search expect.
 * Backend: `{ name, categoryId, sections: [{ header, htmlContent }], htmlContent?, shortDescription? }`
 */
const mapDiseaseDoc = (doc) => {
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
  const fromArray = d["disease-category"] ?? d.diseaseCategory;
  const diseaseCategory = Array.isArray(fromArray)
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
    type: "disease",
    "disease-category": diseaseCategory,
  };
};

export const getDiseasesCatogery = async () => {
  try {
    const snap = await getCollectionSnapshot(COL_DISEASE_CATEGORIES);
    return snap.docs.map(mapCategoryDoc);
  } catch (error) {
    console.error("Error fetching disease categories from Firestore:", error);
    return [];
  }
};

export const getdiseases = async () => {
  try {
    const snap = await getCollectionSnapshot(COL_DISEASES);
    return snap.docs.map(mapDiseaseDoc);
  } catch (error) {
    console.error("Error fetching diseases from Firestore:", error);
    return [];
  }
};

/**
 * Only diseases belonging to the opened category (indexed field categoryId on each doc).
 */
export const getDiseasesByCategoryId = async (categoryId) => {
  try {
    const docs = await fetchDocsByCategoryId(COL_DISEASES, categoryId);
    return docs.map(mapDiseaseDoc);
  } catch (error) {
    console.error("Error fetching diseases by categoryId:", error);
    return [];
  }
};

export const clearDiseasesCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(LEGACY_CACHE_PREFIX));
    if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error("Error clearing diseases cache keys:", error);
  }
};

export const getCacheInfo = async () => {
  return null;
};
