/**
 * Maps CMS / Firestore content into UI rows: { header, htmlContent }.
 * Backend shape: sections[].header, sections[].htmlContent
 */

export function normalizeSectionsFromBackend(rawSections) {
  if (!Array.isArray(rawSections)) return [];
  return rawSections.map((s, index) => {
    const header =
      s?.header ??
      s?.title ??
      s?.name ??
      s?.label ??
      s?.question ??
      s?.heading ??
      `Section ${index + 1}`;
    const htmlContent =
      s?.htmlContent ??
      s?.content ??
      s?.html ??
      s?.body ??
      s?.answer ??
      (typeof s === "string" ? s : "");
    return { header, htmlContent };
  });
}

/**
 * Builds `sections` + legacy `acf['questions_&_answers']` from a Firestore/CMS doc.
 * Prefers `sections[]` when present; ignores root `htmlContent` if sections exist (avoids duplicate full body).
 */
export function buildContentSectionsForUi(d) {
  const legacy = d.acf;
  const legacyQa = legacy?.["questions_&_answers"];

  if (Array.isArray(legacyQa) && legacyQa.length > 0) {
    const sections = legacyQa.map((row) => ({
      header: row.header ?? row.question ?? "",
      htmlContent: row.htmlContent ?? row.answer ?? "",
    }));
    return {
      sections,
      acf: { ...legacy, "questions_&_answers": legacyQa },
    };
  }

  const fromSections = normalizeSectionsFromBackend(d.sections);
  if (fromSections.length > 0) {
    const questionsAndAnswers = fromSections.map((s) => ({
      question: s.header,
      answer: s.htmlContent,
    }));
    return {
      sections: fromSections,
      acf: {
        ...(legacy || {}),
        "questions_&_answers": questionsAndAnswers,
      },
    };
  }

  if (d.htmlContent && String(d.htmlContent).trim() !== "") {
    const row = { header: "Content", htmlContent: d.htmlContent };
    return {
      sections: [row],
      acf: {
        ...(legacy || {}),
        "questions_&_answers": [
          { question: row.header, answer: row.htmlContent },
        ],
      },
    };
  }

  if (d.shortDescription && String(d.shortDescription).trim() !== "") {
    const html = `<p>${d.shortDescription}</p>`;
    const row = { header: "Summary", htmlContent: html };
    return {
      sections: [row],
      acf: {
        ...(legacy || {}),
        "questions_&_answers": [
          { question: row.header, answer: html },
        ],
      },
    };
  }

  return {
    sections: [],
    acf: { ...(legacy || {}), "questions_&_answers": [] },
  };
}
