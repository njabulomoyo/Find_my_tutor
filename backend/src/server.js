const { createApp } = require('./app');
const { initializeDatabase } = require('./db');
const { PORT } = require('./config');

(async () => {
  await initializeDatabase();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})().catch((error) => {
  console.error('Unable to start server.', error);
  process.exitCode = 1;
});
