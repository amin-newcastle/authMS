import path from 'path';

import dotenv from 'dotenv';

// determine the environment from NODE_ENV or default to development
const env = process.env.NODE_ENV || 'development';

// load the appropriate file (.env.development, .env.test, etc.)
const result = dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

if (result.error) {
  console.error(`failed to load .env.${env}:`, result.error);
  process.exit(1);
}

console.log(`Loaded environment variables from .env.${env}`);
console.log('Current variables:');
// print only a whitelist so we don't accidentally log secrets
['NODE_ENV', 'PORT', 'DB_URI', 'JWT_SECRET'].forEach((key) => {
  console.log(`${key}=${process.env[key]}`);
});
