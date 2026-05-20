#!/usr/bin/env node
/**
 * Backfill `count` on category documents based on the number of items in
 * the related entity collection (matched by `categoryId`).
 *
 * Pairs:
 *   diseaseCategories  <-  diseases.categoryId
 *   medicineCategories <-  medicines.categoryId
 *
 * Usage (from project root):
 *   npm run backfill:counts -- --dry-run
 *   npm run backfill:counts
 *   npm run backfill:counts -- --pair=diseases
 *   npm run backfill:counts -- --pair=medicines
 */

const path = require("path");
const admin = require("firebase-admin");

const PAIRS = [
  {
    key: "diseases",
    categoriesCollection: "diseaseCategories",
    itemsCollection: "diseases",
  },
  {
    key: "medicines",
    categoriesCollection: "medicineCategories",
    itemsCollection: "medicines",
  },
];

const BATCH_SIZE = 500;
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyPair = args.find((a) => a.startsWith("--pair="))?.split("=")[1];

const serviceAccountPath = path.join(__dirname, "..", "serviceAccount.json");

function normalizeId(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function categoryKeys(data) {
  const ids = new Set();
  const direct = normalizeId(data.id);
  if (direct) ids.add(direct);
  return ids;
}

function itemCategoryIds(data) {
  const ids = new Set();
  const primary = normalizeId(data.categoryId);
  if (primary) ids.add(primary);

  const arrayCandidates = [
    data["disease-category"],
    data.diseaseCategory,
    data.drug_category,
    data.drugCategory,
    data.categoryIds,
  ];
  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) {
      for (const v of candidate) {
        const norm = normalizeId(v);
        if (norm) ids.add(norm);
      }
    }
  }
  return ids;
}

async function processPair(db, pair) {
  console.log(`\nProcessing ${pair.categoriesCollection} <- ${pair.itemsCollection}...`);

  const [categoriesSnap, itemsSnap] = await Promise.all([
    db.collection(pair.categoriesCollection).get(),
    db.collection(pair.itemsCollection).get(),
  ]);

  const tally = new Map();
  for (const itemDoc of itemsSnap.docs) {
    const ids = itemCategoryIds(itemDoc.data() || {});
    for (const id of ids) {
      tally.set(id, (tally.get(id) || 0) + 1);
    }
  }

  let scanned = 0;
  let updated = 0;
  let upToDate = 0;
  let noMatch = 0;

  let batch = db.batch();
  let batchCount = 0;
  const commitBatch = async () => {
    if (batchCount === 0) return;
    if (!dryRun) await batch.commit();
    batch = db.batch();
    batchCount = 0;
  };

  for (const catDoc of categoriesSnap.docs) {
    scanned += 1;
    const data = catDoc.data() || {};
    const keys = categoryKeys(data);
    keys.add(catDoc.id);

    let count = 0;
    let matched = false;
    for (const key of keys) {
      if (tally.has(key)) {
        count += tally.get(key);
        matched = true;
      }
    }
    if (!matched) noMatch += 1;

    if (data.count === count) {
      upToDate += 1;
      continue;
    }

    updated += 1;
    if (!dryRun) {
      batch.update(catDoc.ref, { count });
      batchCount += 1;
      if (batchCount >= BATCH_SIZE) {
        await commitBatch();
        process.stdout.write(
          `  ${pair.categoriesCollection}: committed ${updated} updates...\r`
        );
      }
    }
  }

  await commitBatch();

  console.log(
    `  ${pair.categoriesCollection}: scanned=${scanned}, toUpdate=${updated}, ` +
      `upToDate=${upToDate}, noMatch=${noMatch} (items=${itemsSnap.size})`
  );

  return { pair: pair.key, scanned, updated, upToDate, noMatch };
}

async function main() {
  console.log(
    dryRun
      ? "DRY RUN — no documents will be written.\n"
      : "LIVE RUN — Firestore will be updated.\n"
  );

  let serviceAccount;
  try {
    serviceAccount = require(serviceAccountPath);
  } catch {
    console.error(
      `Could not load ${serviceAccountPath}\n` +
        "Place serviceAccount.json in the project root (Firebase Console → Service accounts)."
    );
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();
  const targets = onlyPair ? PAIRS.filter((p) => p.key === onlyPair) : PAIRS;

  if (targets.length === 0) {
    console.error(
      `Unknown --pair "${onlyPair}". Use one of: ${PAIRS.map((p) => p.key).join(", ")}`
    );
    process.exit(1);
  }

  for (const pair of targets) {
    await processPair(db, pair);
  }

  console.log("\nDone.");
  if (dryRun) {
    console.log("Re-run without --dry-run to apply changes.");
  } else {
    console.log("Check Home: category tiles should now show real counts.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
