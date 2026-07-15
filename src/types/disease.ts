export type DiseaseSection = {
  header?: string;
  question?: string;
  htmlContent?: string;
  answer?: string;
};

export type DiseaseListItem = {
  id: string | number;
  name?: string;
  slug?: string;
  type?: 'disease' | 'drug';
  categoryId?: string | number;
  title: { rendered: string };
  acf?: {
    'questions_&_answers'?: DiseaseSection[];
    [key: string]: unknown;
  };
  sections?: DiseaseSection[];
  shortDescription?: string;
  htmlContent?: string;
  'disease-category'?: (string | number)[];
  drug_category?: (string | number)[];
};

export type DiseaseCategoryParams = {
  diseaseId: string | number;
  image?: string;
  heading: string;
  count: string | number;
  type: string;
  fvrtScreen?: boolean;
  rcntScreen?: boolean;
};
