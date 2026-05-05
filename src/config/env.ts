import path from 'path';

import dotenv from 'dotenv';

// Determine the current environment (development, test, production).
// Defaults to 'development' if NODE_ENV is not set.
const env = process.env.NODE_ENV || 'development';

// Load the matching .env file for the current environment (e.g. .env.development, .env.test).
// This means secrets and config never need to be hardcoded in source code.
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

// Centralised config object — all environment variables are read once here.
// The rest of the app imports this object instead of reading process.env directly,
// which makes it easy to see all config in one place and swap values in tests.
const config = {
  nodeEnv: env,
  port: process.env.PORT || 3000,
  dbUri: process.env.DB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

export default config;
