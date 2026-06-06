const { closePool } = require("./db");
const { runMigrations } = require("./migrationRunner");

runMigrations()
  .then(async () => {
    await closePool();
    console.log("migrations complete");
  })
  .catch(async (error) => {
    await closePool();
    console.error(error);
    process.exit(1);
  });
