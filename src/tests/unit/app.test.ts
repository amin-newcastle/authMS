import { describe, expect, it } from '@jest/globals';
import request from 'supertest';

import app from '../../app.ts';

describe('app', () => {
  it('returns health status for monitoring checks', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'ok', service: 'authms' });
  });
});
