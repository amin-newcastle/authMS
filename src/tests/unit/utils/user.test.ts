import { describe, it, expect } from '@jest/globals';

import { readUserFixture, buildHashedUser } from '../../utils/user.ts';

describe('test utils: user', () => {
  it('readUserFixture returns object with username and password', () => {
    const f = readUserFixture();
    expect(f).toHaveProperty('username');
    expect(f).toHaveProperty('password');
  });

  it('buildHashedUser can include _id when option is set', async () => {
    const result = await buildHashedUser({ includeId: true, id: 'xyz' });
    expect(result).toHaveProperty('_id', 'xyz');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('password');
    const fixture = readUserFixture();
    expect(result.password).not.toBe(fixture.password);
  });

  it('buildHashedUser returns user without _id when no options provided', async () => {
    const result = await buildHashedUser();
    expect(result).not.toHaveProperty('_id');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('password');
    const fixture = readUserFixture();
    expect(result.password).not.toBe(fixture.password);
  });
});
