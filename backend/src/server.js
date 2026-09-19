const fs = require('fs');
const path = require('path');
const app = require('./app');
const { connectDB } = require('./config/db');
const env = require('./config/env');
const { autoSeedIfEmpty } = require('./seed/seed');

const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function startServer() {
  await connectDB();
  await autoSeedIfEmpty();

  const server = app.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(`  OBLIQ Audit Review System Backend API is running!`);
    console.log(`  Port: http://localhost:${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`====================================================`);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = { startServer };
