import path from 'path';

import dotenv from 'dotenv';

// Defaults to 'development' if NODE_ENV is not set
const env = process.env.NODE_ENV || 'development';

// Loads .env.<environment> file (e.g. .env.development) — keeps secrets out of source code
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

// Centralised config — all env vars read once here, imported everywhere else
const config = {
  nodeEnv: env,
  port: process.env.PORT || 3000,
  dbUri: process.env.DB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

export default config;
