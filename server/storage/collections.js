const fs = require("fs");
const path = require("path");
const { dataDir, storageDriver } = require("../config");
const { query, isDatabaseReady } = require("../db");

fs.mkdirSync(dataDir, { recursive: true });

function dataPath(name) {
  return path.join(dataDir, `${name}.json`);
}

function readJson(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(dataPath(name), "utf8"));
  } catch (_error) {
    return fallback;
  }
}

function writeJson(name, value) {
  fs.writeFileSync(dataPath(name), JSON.stringify(value, null, 2));
}

async function usePostgres() {
  return storageDriver === "postgres" && (await isDatabaseReady());
}

async function readCollection(name, fallback = []) {
  if (await usePostgres()) {
    const result = await query("select data from app_collections where name = $1", [name]);
    return result.rows[0]?.data ?? fallback;
  }

  return readJson(name, fallback);
}

async function writeCollection(name, value) {
  if (await usePostgres()) {
    await query(
      `
        insert into app_collections (name, data, updated_at)
        values ($1, $2::jsonb, now())
        on conflict (name)
        do update set data = excluded.data, updated_at = now()
      `,
      [name, JSON.stringify(value)]
    );
    return;
  }

  writeJson(name, value);
}

module.exports = {
  readCollection,
  writeCollection
};
