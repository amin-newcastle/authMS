import fs from 'fs';
import path from 'path';

import bcrypt from 'bcrypt';

// Shape of the raw user fixture file
type FixtureUser = {
  username: string;
  password: string;
};

// Options to override fixture defaults when building a test user
type BuildUserOptions = {
  username?: string;
  password?: string;
  includeId?: boolean; // Whether to attach a _id field (needed for login tests)
  id?: string; // Custom _id value, defaults to '123'
};

// Path to the static JSON fixture used as the base user data
const fixturePath = path.resolve('src/tests/mock-data/user/user.json');

// Reads and parses the user fixture file
export const readUserFixture = (): FixtureUser => {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as FixtureUser;
};

// Builds a test user with a real bcrypt-hashed password.
// Accepts overrides so individual tests can customise username, password, or _id.
export const buildHashedUser = async (
  options: BuildUserOptions = {},
): Promise<{ username: string; password: string; _id?: string }> => {
  const base = readUserFixture();
  const username = options.username ?? base.username;
  const plainPassword = options.password ?? base.password;
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const user = { username, password: hashedPassword };

  // Only attach _id if explicitly requested — mirrors how Mongoose returns documents
  return options.includeId ? { ...user, _id: options.id ?? '123' } : user;
};
