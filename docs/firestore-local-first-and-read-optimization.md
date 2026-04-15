# Firestore: fewer reads, local-first, and “download for later”

This document describes how to reduce **Firestore document reads** (billing) while keeping the app responsive and supporting **offline / download-later** behavior. Use it when you implement the strategy in Doctor on Call.

---

## Why reads are high today

- Firestore charges **one read per document returned** by a query (and per `get()` on a doc).
- In this project, **Home** loads merged search data via **`getdiseases()`** and **`getDrugs()`**, which typically map to **`collection('diseases').get()`** and **`collection('medicines').get()`** — i.e. **one read per disease + one read per medicine** on each cold load (and whenever you intentionally refetch full collections).
- Category-scoped queries (`getDiseasesByCategoryId` / `getMedicinesByCategoryId`) only read documents matching `categoryId`, which is better, but the **full-collection** paths dominate cost at scale.

---

## Goals

| Goal | Approach |
|------|----------|
| Cut billed reads | Avoid full-collection `get()` on every app open; use **manifest/version**, **pagination**, or **bundled payloads**. |
| Fast first paint | **Local-first**: show cached data immediately, then refresh in background if remote is newer. |
| Download for later | Persist a **versioned snapshot** on device (file or SQLite); optional **Cloud Storage** JSON for one download per release. |

---

## Recommended architecture (phased)

### Phase 1 — Quick wins (no backend schema change beyond a small meta doc)

1. **Home screen**
   - Load only **category collections** for tiles: `diseaseCategories`, `medicineCategories` (smaller than full catalogs).
   - **Do not** call full `getdiseases()` / `getDrugs()` on Home unless the user opens search or you implement a cheaper search path.

2. **Search**
   - Replace “merge all diseases + all drugs in memory” with one of:
     - **Paginated / limited** Firestore queries (e.g. `orderBy` + `startAt`/`endAt` on a normalized `searchTokens` field — requires indexing and data design), or
     - **External search** (Algolia, Typesense, etc.) backed by a sync job, or
     - **Cloud Function** that returns top-N matches (function still reads Firestore, but you control batching and caching server-side).

3. **Detail / list screens**
   - Keep loading **by `categoryId`** where possible (already partially done in `ListOfDiseases`).

### Phase 2 — Local-first + version check (strong read reduction)

**Idea:** One tiny read (or zero) decides whether the big catalog needs a refresh.

1. **Firestore: add a metadata document** (example shape):

   ```text
   Collection: appConfig (or meta)
   Document:   content
   Fields:     diseasesVersion: number (or string)
               medicinesVersion: number
               updatedAt: timestamp
   ```

2. **On device:** persist alongside cached data:

   - `localDiseasesVersion`, `localMedicinesVersion` (AsyncStorage is fine for these **small** keys).
   - Full catalog: **not** in AsyncStorage if large — use **SQLite**, **MMKV**, or **filesystem** (`react-native-fs`).

3. **Flow:**

   ```text
   1. Read local cache → render UI immediately (0 Firestore reads for catalog).
   2. getDoc(appConfig/content) from server → 1 read.
   3. If remote version === local version → STOP (0 further reads).
   4. Else → incremental or full sync (see Phase 3), then update local version.
   ```

4. **Stale-while-revalidate UX:** show cached list; optional banner “Updating…”; replace state when new payload arrives.

**Note:** Using `get({ source: 'server' })` on large collections **every** open will **not** reduce reads. The win comes from **skipping** the big query when the manifest says nothing changed.

### Phase 3 — Minimum reads for “download for later”

**Option A — Firestore-only (moderate reads on update day)**

- On version bump, run **batched** reads/writes or **paginated** `limit(500)` loops until all docs are synced to local DB.
- Still **many reads** on update days; **zero** on most days if version unchanged.

**Option B — Cloud Storage JSON (often lowest Firestore reads)**

- Export published `diseases` / `medicines` (or a single merged file) as **versioned JSON** in **Firebase Storage** (e.g. `content/v42/diseases.json`).
- `appConfig/content` holds `storagePath` + `version`.
- App: **1 doc read** (or cache that too) + **1 Storage download** per update — **no per-document Firestore reads** for the bulk body.
- Best fit for large static-ish medical content that changes on release cycles.

---

## Firestore persistence vs billed reads

- **Client persistence** (offline cache) improves UX and can avoid **duplicate network** fetches in some cases.
- **Billed reads** are still charged when the SDK **reads from the server** for that request.
- Strategy: **manifest gate** + **local store** = fewer **server** reads, which is what billing follows for normal `get`/`onSnapshot` from server.

---

## Pagination pattern (sketch)

```text
query(collection('diseases'), orderBy('id'), limit(PAGE_SIZE))
// next page: startAfter(lastDocSnapshot)
```

- Reads = **only documents in that page**.
- Combine with search indexes or server-side search for “typeahead” without scanning the whole collection on the client.

---

## Implementation checklist (this repo)

- [ ] Add `appConfig/content` (or equivalent) with **version** fields maintained when admins publish.
- [ ] Introduce a **local cache layer** (SQLite or files) for disease/medicine **lists** and **detail payloads** if needed offline.
- [ ] Refactor **Home** to stop unconditional `getdiseases()` + `getDrugs()`; defer full merge to search or post-manifest sync.
- [ ] Implement **read local → compare version → conditional sync** in `src/Hooks/api/diseases.js` and `src/Hooks/api/drugs.js` (or a new `ContentSyncService`).
- [ ] Add user-facing **“Download for offline”** that triggers sync once and sets a flag; show **last updated** from manifest.
- [ ] (Optional) Move bulk payloads to **Storage** + version pointer in Firestore.

---

## Security rules reminder

- If content is **public** to signed-in users, rules can stay simple; if **tiered**, ensure **server** or **rules** enforce access so cached blobs on device don’t bypass entitlement (consider encryption for premium payloads if required).

---

## References

- [Firestore pricing — reads](https://firebase.google.com/docs/firestore/pricing)
- [Get data with source (server vs cache)](https://firebase.google.com/docs/firestore/query-data/get-data#source_options)
- [Paginate data with query cursors](https://firebase.google.com/docs/firestore/query-data/query-cursors)

---

*Generated for Doctor on Call — implement when ready; adjust collection names (`diseases`, `medicines`, `diseaseCategories`, `medicineCategories`) to match your production schema.*
