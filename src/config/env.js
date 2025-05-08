import * as dotenv from 'dotenv';
import { resolve } from 'path';

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: resolve(process.cwd(), `.env.${env}`),
});

export const config = {
  nodeEnv: env,
  port: process.env.PORT || 3000,
  dbUri: process.env.DB_URI || '',
};
