export type CategoryData = {
  diseaseId: string | number;
  [key: string]: unknown;
};

export type RecentDiseaseItem = {
  catId: string | number;
  diseaseID: string | number;
};

export type FavoriteDiseaseItem = RecentDiseaseItem;
