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

const formatValue = (key: string, value: string | undefined): string => {
  if (!value) {
    return '<not set>';
  }

  if (key === 'DB_URI' || key === 'JWT_SECRET') {
    return '<set>';
  }

  return value;
};

const variables = [
  { key: 'NODE_ENV', value: process.env.NODE_ENV },
  { key: 'PORT', value: process.env.PORT },
  { key: 'DB_URI', value: process.env.DB_URI },
  { key: 'JWT_SECRET', value: process.env.JWT_SECRET },
];

variables.forEach(({ key, value }) => {
  console.log(`${key}=${formatValue(key, value)}`);
});
