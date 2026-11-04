export type CategoryItem = {
  id: string | number;
  name: string;
  count: string | number;
  imageUrl?: string | null;
  color: string;
  taxonomy?: string;
  acf?: {
    category_image?: string;
  };
};

export type SearchResultItem = {
  id: string | number;
  type: 'disease' | 'drug';
  title: { rendered: string };
  acf?: unknown;
  sections?: unknown;
  shortDescription?: string;
  htmlContent?: string;
  categoryId?: string | number;
  categoryIds?: (string | number)[];
  'disease-category'?: (string | number)[];
  drug_category?: (string | number)[];
};
