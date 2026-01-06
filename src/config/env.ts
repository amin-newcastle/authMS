import path from 'path';

import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

const config = {
  nodeEnv: env,
  port: process.env.PORT || 3000,
  dbUri: process.env.DB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
};

export default config;
