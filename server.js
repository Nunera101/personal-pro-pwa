const { createServer } = require("./server/app");
const { runMigrations } = require("./server/migrationRunner");

const port = Number(process.env.PORT || 3000);

async function start() {
  if (process.env.DATABASE_URL) {
    await runMigrations();
  }

  const { server } = createServer();
  server.listen(port, () => {
    console.log(`Personal Pro PWA running on port ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
