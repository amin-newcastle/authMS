import mongoose from 'mongoose';

import config from './env.js';

const connectDB = async (): Promise<void> => {
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
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
