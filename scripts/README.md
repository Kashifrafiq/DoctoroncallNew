# Scripts

## Backfill search index (`nameLower` + `searchKeywords`)

Prepares Firestore so app search can match words **anywhere** in a title (e.g. `asthma` → "Bronchial asthma (Long Term Management)").

### Prerequisites

1. `serviceAccount.json` in the **project root** (Firebase Console → Project settings → Service accounts → Generate new private key).
2. **Never commit** this file (it is in `.gitignore`).

### Install Admin SDK (once)

```bash
npm install firebase-admin --save-dev
```

### Run

From project root:

```bash
# Preview — no writes
npm run backfill:search -- --dry-run

# Apply to diseases + medicines
npm run backfill:search

# One collection only
npm run backfill:search -- --collection=diseases
```

### After backfill

- Reload the app and try search: `asthma`, `ac`, `vu`, etc.
- When adding new diseases/medicines, set `nameLower` and `searchKeywords` on save (or re-run this script).

---

## Backfill category counts (`count`)

Recomputes `count` on each category document based on the number of items
that point at it via `categoryId` (also supports legacy array fields
`disease-category`, `drug_category`, etc.).

```bash
# Preview
npm run backfill:counts -- --dry-run

# Apply to diseaseCategories AND medicineCategories
npm run backfill:counts

# One pair only
npm run backfill:counts -- --pair=diseases
npm run backfill:counts -- --pair=medicines
```

Re-run any time items are added/removed in `diseases` or `medicines`.
