const { Pool } = require("pg");
const { databaseUrl, storageDriver } = require("./config");

let pool = null;

function getPool() {
  if (storageDriver !== "postgres" || !databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 8,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }
  return pool;
}

async function query(text, params = []) {
  const db = getPool();
  if (!db) throw new Error("Postgres is not configured.");
  return db.query(text, params);
}

async function isDatabaseReady() {
  const db = getPool();
  if (!db) return false;
  try {
    await db.query("select 1");
    return true;
  } catch (_error) {
    return false;
  }
}

async function closePool() {
  if (pool) await pool.end();
  pool = null;
}

module.exports = {
  getPool,
  query,
  isDatabaseReady,
  closePool
};
