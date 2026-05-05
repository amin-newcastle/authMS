import mongoose from 'mongoose';

import config from './env.js';

const connectDB = async (): Promise<void> => {
  // Guard: if no DB_URI is configured, skip the connection attempt.
  // This is useful in test environments where an in-memory DB is used instead.
  if (!config.dbUri) {
    console.warn('DB_URI not set; skipping MongoDB connection');
    return;
  }
  try {
    await mongoose.connect(config.dbUri as string);
    console.log('MongoDB connected');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('MongoDB connection error:', message);
    // In production, a failed DB connection is unrecoverable — exit immediately.
    // In development/test, we log the error and continue so the process doesn't crash.
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
