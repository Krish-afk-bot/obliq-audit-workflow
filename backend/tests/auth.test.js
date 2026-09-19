const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Authentication & Identity Pipeline', () => {
  it('should authenticate Staff (Rohit) successfully and return JWT token and firm context', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rohit@abcca.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      name: 'Rohit Sharma (Staff)',
      email: 'rohit@abcca.com',
      role: 'STAFF',
      firmCode: 'ABC-CA'
    });
  });

  it('should authenticate Reviewer (Aman) successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'aman@abcca.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('REVIEWER');
  });

  it('should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'rohit@abcca.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request to /api/auth/me', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return authentic identity on /api/auth/me when token is supplied', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'aman@abcca.com',
        password: 'password123'
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('aman@abcca.com');
    expect(meRes.body.data.user.role).toBe('REVIEWER');
  });
});
