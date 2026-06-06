const fs = require("fs");
const path = require("path");
const { getPool } = require("./db");

async function runMigrations(options = {}) {
  const logger = options.logger || console;
  const pool = getPool();
  if (!pool) {
    throw new Error("DATABASE_URL nao configurado. Defina DATABASE_URL antes de rodar as migracoes.");
  }

  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  await pool.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  for (const file of files) {
    const version = path.basename(file, ".sql");
    const exists = await pool.query("select 1 from schema_migrations where version = $1", [version]);
    if (exists.rowCount) {
      logger.log(`skip ${version}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (version) values ($1)", [version]);
      await client.query("commit");
      logger.log(`applied ${version}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = {
  runMigrations
};
