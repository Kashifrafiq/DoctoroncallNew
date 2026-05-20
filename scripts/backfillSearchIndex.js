#!/usr/bin/env node
/**
 * One-time backfill: sets nameLower + searchKeywords on diseases & medicines.
 *
 * Usage (from project root):
 *   npm run backfill:search -- --dry-run
 *   npm run backfill:search
 *   npm run backfill:search -- --collection=diseases
 */

const path = require("path");
const admin = require("firebase-admin");
const {
  buildSearchKeywordsFromName,
  resolveDisplayName,
} = require("./lib/searchKeywords");

const COLLECTIONS = ["diseases", "medicines"];
const BATCH_SIZE = 500;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyCollection = args
  .find((a) => a.startsWith("--collection="))
  ?.split("=")[1];

const serviceAccountPath = path.join(__dirname, "..", "serviceAccount.json");

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function needsUpdate(data, nameLower, searchKeywords) {
  if (data.nameLower !== nameLower) return true;
  return !arraysEqual(data.searchKeywords, searchKeywords);
}

async function backfillCollection(db, collectionName) {
  const snap = await db.collection(collectionName).get();
  let scanned = 0;
  let updated = 0;
  let skippedNoName = 0;
  let skippedUpToDate = 0;

  let batch = db.batch();
  let batchCount = 0;

  const commitBatch = async () => {
    if (batchCount === 0) return;
    if (!dryRun) {
      await batch.commit();
    }
    batch = db.batch();
    batchCount = 0;
  };

  for (const doc of snap.docs) {
    scanned += 1;
    const data = doc.data() || {};
    const displayName = resolveDisplayName(data);

    if (!displayName) {
      skippedNoName += 1;
      continue;
    }

    const nameLower = displayName.toLowerCase();
    const searchKeywords = buildSearchKeywordsFromName(displayName);

    if (!needsUpdate(data, nameLower, searchKeywords)) {
      skippedUpToDate += 1;
      continue;
    }

    updated += 1;
    if (!dryRun) {
      batch.update(doc.ref, { nameLower, searchKeywords });
      batchCount += 1;
      if (batchCount >= BATCH_SIZE) {
        await commitBatch();
        process.stdout.write(`  ${collectionName}: committed ${updated} updates...\r`);
      }
    }
  }

  await commitBatch();

  return {
    collectionName,
    scanned,
    updated,
    skippedNoName,
    skippedUpToDate,
  };
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
  const targets = onlyCollection
    ? [onlyCollection]
    : COLLECTIONS;

  for (const name of targets) {
    if (!COLLECTIONS.includes(name)) {
      console.error(`Unknown collection "${name}". Use: ${COLLECTIONS.join(", ")}`);
      process.exit(1);
    }
  }

  const summary = [];
  for (const collectionName of targets) {
    console.log(`Processing ${collectionName}...`);
    const result = await backfillCollection(db, collectionName);
    summary.push(result);
    console.log(
      `  ${result.collectionName}: scanned=${result.scanned}, ` +
        `toUpdate=${result.updated}, upToDate=${result.skippedUpToDate}, noName=${result.skippedNoName}`
    );
  }

  console.log("\nDone.");
  if (dryRun) {
    console.log("Re-run without --dry-run to apply changes.");
  } else {
    console.log("Test in the app: search e.g. asthma, vu, ac on disease/drug names.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
