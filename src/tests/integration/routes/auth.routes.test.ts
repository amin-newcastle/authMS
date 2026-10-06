import { beforeEach, describe, expect, it } from '@jest/globals';
import bcrypt from 'bcrypt';
import request from 'supertest';

import User from '../../../api/models/user.model.ts';
import app from '../../../app.ts';

describe('authentication routes integration', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('registers sanitized credentials and completes login and token verification', async () => {
    const username = 'integrationuser';
    const password = '  password123  ';
    const suppliedId = '507f1f77bcf86cd799439011';
    const registration = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: `  ${username}  `,
        password,
        _id: suppliedId,
        admin: true,
      })
      .expect(201);

    expect(registration.body).toEqual({
      success: true,
      message: 'User registered successfully',
      user: { _id: expect.any(String), username },
    });
    expect(registration.body.user._id).not.toBe(suppliedId);
    expect(registration.body.user).not.toHaveProperty('password');

    const storedUser = await User.findById(registration.body.user._id);
    expect(storedUser).not.toBeNull();
    expect(storedUser!.username).toBe(username);
    expect(storedUser!.password).not.toBe(password);
    expect(storedUser!.toObject()).not.toHaveProperty('admin');
    expect(await bcrypt.compare(password, storedUser!.password)).toBe(true);
    expect(await bcrypt.compare(password.trim(), storedUser!.password)).toBe(
      false,
    );

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: registration.body.user.username, password })
      .expect(200);

    expect(login.body).toEqual({ success: true, token: expect.any(String) });

    const verification = await request(app)
      .post('/api/v1/auth/verify')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);

    expect(verification.body).toMatchObject({
      success: true,
      decoded: { id: registration.body.user._id },
    });
  });

  it('treats padded and unpadded registration usernames as the same account', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ username: '  duplicateuser  ', password: 'password123' })
      .expect(201);

    const duplicate = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'duplicateuser', password: 'password123' })
      .expect(400);

    expect(duplicate.body).toEqual({
      success: false,
      message: 'User already exists',
    });
    expect(await User.countDocuments({ username: 'duplicateuser' })).toBe(1);
  });

  it('allows existing whitespace usernames and short passwords to log in', async () => {
    const username = ' x ';
    const password = 'pwd';
    await User.create({
      username,
      password: await bcrypt.hash(password, 10),
    });

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ username, password })
      .expect(200);

    expect(login.body).toEqual({ success: true, token: expect.any(String) });
  });
});
