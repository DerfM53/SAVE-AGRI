import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { setupTestDatabase, cleanupTestDatabase } from './setup.js';
import { getPool, closePool } from '../config/database.js';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
  await closePool();
});

describe('Authentication Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('devrait rejeter une requête sans header Authorization', () => {
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Format d'authentification invalide"
    });
  });

  test('devrait accepter un token valide', () => {
    const user = { id: 1, username: 'testuser' };
    const token = jwt.sign(user, process.env.JWT_SECRET);
    req.headers['authorization'] = `Bearer ${token}`;

    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(user.id);
  });

  test('devrait rejeter un token malformé', () => {
    req.headers['authorization'] = 'Bearer invalid.token.here';

    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token invalide"
    });
  });

  test('devrait rejeter un token expiré', () => {
    const user = { id: 1, username: 'testuser' };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '0s' });
    req.headers['authorization'] = `Bearer ${token}`;

    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token expiré, veuillez vous reconnecter"
    });
  });
});