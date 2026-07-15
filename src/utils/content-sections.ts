import type { DiseaseSection } from '@/types/disease';

type RawSection = {
  header?: string;
  title?: string;
  name?: string;
  label?: string;
  question?: string;
  heading?: string;
  htmlContent?: string;
  content?: string;
  html?: string;
  body?: string;
  answer?: string;
};

type ContentDoc = {
  acf?: {
    'questions_&_answers'?: DiseaseSection[];
    [key: string]: unknown;
  };
  sections?: RawSection[] | DiseaseSection[];
  htmlContent?: string;
  shortDescription?: string;
};

type UiSection = {
  header: string;
  htmlContent: string;
};

export function normalizeSectionsFromBackend(rawSections: unknown): UiSection[] {
  if (!Array.isArray(rawSections)) {
    return [];
  }

  return rawSections.map((section, index) => {
    const s = section as RawSection | string;
    const header =
      (typeof s === 'object' && s !== null
        ? (s.header ??
          s.title ??
          s.name ??
          s.label ??
          s.question ??
          s.heading)
        : undefined) ?? `Section ${index + 1}`;
    const htmlContent =
      (typeof s === 'object' && s !== null
        ? (s.htmlContent ?? s.content ?? s.html ?? s.body ?? s.answer)
        : undefined) ?? (typeof s === 'string' ? s : '');

    return { header, htmlContent };
  });
}

export function buildContentSectionsForUi(doc: ContentDoc) {
  const legacy = doc.acf;
  const legacyQa = legacy?.['questions_&_answers'];

  if (Array.isArray(legacyQa) && legacyQa.length > 0) {
    const sections = legacyQa.map((row) => ({
      header: row.header ?? row.question ?? '',
      htmlContent: row.htmlContent ?? row.answer ?? '',
    }));

    return {
      sections,
      acf: { ...legacy, 'questions_&_answers': legacyQa },
    };
  }

  const fromSections = normalizeSectionsFromBackend(doc.sections);
  if (fromSections.length > 0) {
    const questionsAndAnswers = fromSections.map((section) => ({
      question: section.header,
      answer: section.htmlContent,
    }));

    return {
      sections: fromSections,
      acf: {
        ...(legacy || {}),
        'questions_&_answers': questionsAndAnswers,
      },
    };
  }

  if (doc.htmlContent && String(doc.htmlContent).trim() !== '') {
    const row = { header: 'Content', htmlContent: doc.htmlContent };
    return {
      sections: [row],
      acf: {
        ...(legacy || {}),
        'questions_&_answers': [{ question: row.header, answer: row.htmlContent }],
      },
    };
  }

  if (doc.shortDescription && String(doc.shortDescription).trim() !== '') {
    const html = `<p>${doc.shortDescription}</p>`;
    const row = { header: 'Summary', htmlContent: html };
    return {
      sections: [row],
      acf: {
        ...(legacy || {}),
        'questions_&_answers': [{ question: row.header, answer: html }],
      },
    };
  }

  return {
    sections: [],
    acf: { ...(legacy || {}), 'questions_&_answers': [] },
  };
}
