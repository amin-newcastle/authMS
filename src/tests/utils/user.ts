import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

type FixtureUser = {
  username: string;
  password: string;
};

type BuildUserOptions = {
  username?: string;
  password?: string;
  includeId?: boolean;
  id?: string;
};

const fixturePath = path.resolve('src/tests/mock-data/user/user.json');

export const readUserFixture = (): FixtureUser => {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8')) as FixtureUser;
};

export const buildHashedUser = async (
  options: BuildUserOptions = {},
): Promise<{ username: string; password: string; _id?: string }> => {
  const base = readUserFixture();
  const username = options.username ?? base.username;
  const plainPassword = options.password ?? base.password;

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const user = {
    username,
    password: hashedPassword,
  };

  return options.includeId
    ? {
        _id: options.id ?? '123',
        ...user,
      }
    : user;
};
