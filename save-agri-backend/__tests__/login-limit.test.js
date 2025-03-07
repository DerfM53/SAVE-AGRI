import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import router from '../routes/users.js';
import { validateUserData, validatePassword } from '../routes/users.js';
import { setupTestDatabase, cleanupTestDatabase } from './setup.js';
import { getPool, closePool } from '../config/database.js';

const app = express();
app.use(express.json());
app.use('/users', router);

let server;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
  await closePool();
});

beforeEach(() => {
  server = app.listen(0);
  if (router.loginLimiter) {
    router.loginLimiter.resetKey('::ffff:127.0.0.1');
  }
});

afterEach(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

describe('Tests d\'authentification', () => {
  test('devrait bloquer après 5 tentatives', async () => {
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/users/login')
        .send({ username: 'test', password: 'test123' });

      if (i < 5) {
        expect(response.status).toBe(401);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });

  test('devrait générer un token JWT valide lors de la connexion', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({ 
        username: 'test_user', 
        password: 'Test123@' 
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});

describe('Tests d\'enregistrement utilisateur', () => {
  beforeEach(async () => {
    const pool = getPool();
    await pool.query('DELETE FROM users WHERE username = $1', ['newuser']);
  });

  test('devrait créer un nouvel utilisateur', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'newuser',
        email: 'new@test.com',
        password: 'StrongPass123!'
      });
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.username).toBe('newuser');
  });
    
  describe('Tests de validation', () => {
      test('devrait rejeter un utilisateur avec un mot de passe faible', async () => {
        const response = await request(app)
          .post('/users')  // Modification ici
          .send({
            username: 'weakuser',
            password: '123',
            email: 'weak@test.com'
          });
    
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
      });
  
      test('devrait rejeter un email invalide', async () => {
        const response = await request(app)
          .post('/users/')
          .send({
            username: 'emailuser',
            password: 'Test123@',
            email: 'notanemail'
          });
  
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
      });
  
      test('devrait rejeter un nom d\'utilisateur déjà utilisé', async () => {
        const response = await request(app)
          .post('/users/')
          .send({
            username: 'test_user',
            password: 'Test123@',
            email: 'another@test.com'
          });
  
        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('message');
      });
    });
  
    describe('Tests de validation', () => {
      test('devrait valider un mot de passe fort', () => {
        const result = validatePassword('Test123@');
        expect(result.isValid).toBe(true);
      });
  
      test('devrait rejeter un mot de passe faible', () => {
        const result = validatePassword('123');
        expect(result.isValid).toBe(false);
        expect(result.message).toBeTruthy();
      });
  
      test('devrait valider des données utilisateur valides', () => {
        const userData = {
          username: 'testuser',
          password: 'Test123@',
          email: 'test@example.com'
        };
        const result = validateUserData(userData);
        expect(result).toBeTruthy();
        expect(result).toHaveProperty('isValid', true);
      });
    });
  });