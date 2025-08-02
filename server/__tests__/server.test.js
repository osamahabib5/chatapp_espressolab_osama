const request = require('supertest');
const { app } = require('../index');

describe('Server API Tests', () => {
  describe('Authentication', () => {
    test('POST /api/auth/register - should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
    });

    test('POST /api/auth/login - should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('POST /api/auth/login - should fail with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('Rooms', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
      // Register and login to get token
      const userData = {
        email: 'roomtest@example.com',
        name: 'Room Test User',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    test('GET /api/rooms - should get rooms with valid token', async () => {
      const response = await request(app)
        .get('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/rooms - should fail without token', async () => {
      await request(app)
        .get('/api/rooms')
        .expect(401);
    });

    test('POST /api/rooms - should create a new room', async () => {
      const roomData = {
        name: 'Test Room'
      };

      const response = await request(app)
        .post('/api/rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roomData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(roomData.name);
      expect(response.body.createdBy).toBe(userId);
    });
  });
}); 