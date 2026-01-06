import mongoose from 'mongoose';
import config from './env.ts';

const connectDB = async () => {
  if (!config.dbUri) {
    console.warn('DB_URI not set; skipping MongoDB connection');
    return;
  }
  try {
    await mongoose.connect(config.dbUri as string);
    console.log('MongoDB connected');
  } catch (err: any) {
    console.error('MongoDB connection error:', err?.message || err);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
