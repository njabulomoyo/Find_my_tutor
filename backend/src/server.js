const { createApp } = require('./app');
const { initializeDatabase } = require('./db');

const PORT = process.env.PORT || 5050;

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
