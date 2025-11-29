const Agenda = require('agenda');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/development';

// Create Agenda instance
const agenda = new Agenda({
  db: {
    address: MONGO_URI,
    collection: 'emailJobs', // Collection name for storing jobs
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  processEvery: '10 seconds', // How often to check for jobs
  maxConcurrency: 5, // Max number of jobs to process concurrently
  defaultConcurrency: 3, // Default concurrency for jobs
  lockLimit: 0, // No limit on lock
  defaultLockLimit: 0,
  defaultLockLifetime: 10 * 60 * 1000, // 10 minutes
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Gracefully shutting down Agenda...');
  await agenda.stop();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = agenda;
