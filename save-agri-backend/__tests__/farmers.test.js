import request from 'supertest';
import express from 'express';
import router from '../routes/farmers.js';
import userRouter from '../routes/users.js';
import { setupTestDatabase, cleanupTestDatabase } from './setup.js';
import { getPool, closePool } from '../config/database.js';

const app = express();
app.use(express.json());
app.use('/users', userRouter);
app.use('/farmers', router);

let server;
let authToken;
let testUser;

beforeAll(async () => {
  testUser = await setupTestDatabase();
  const loginResponse = await request(app)
    .post('/users/login')
    .send({ username: 'test_user', password: 'Test123@' });
  authToken = loginResponse.body.token;
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
});

afterEach(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

describe('Tests des routes agriculteurs', () => {
  test('devrait rechercher des agriculteurs par ville', async () => {
    const response = await request(app)
      .get('/farmers')
      .query({
        city: 'Paris',
        radius: '10'
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('devrait créer un nouvel agriculteur', async () => {
    const farmerData = {
      name: 'Ferme Test',
      description: 'Une ferme de test',
      address: '123 Rue des Tests',
      city: 'Paris',
      zip_code: '75001',
      phone: '0123456789',
      website: 'www.fermetest.com',
      user_id: testUser.id, // Ajout de l'ID utilisateur
      latitude: 48.8534,
      longitude: 2.3488
    };

    const response = await request(app)
      .post('/farmers')
      .set('Authorization', `Bearer ${authToken}`)
      .send(farmerData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(farmerData.name);
  });

  test('devrait rejeter la création sans token', async () => {
    const response = await request(app)
      .post('/farmers')
      .send({
        name: 'Ferme Test'
      });

    expect(response.status).toBe(401);
  });

  test('devrait récupérer un agriculteur par son ID', async () => {
    // D'abord créer un agriculteur
    const createResponse = await request(app)
      .post('/farmers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Ferme Test Get',
        description: 'Test de récupération',
        address: '123 Rue des Tests',
        city: 'Paris',
        zip_code: '75001',
        phone: '0123456789',
        user_id: testUser.id,
        latitude: 48.8534,
        longitude: 2.3488
      });

    expect(createResponse.status).toBe(201);
    const farmerId = createResponse.body.id;

    // Ensuite le récupérer
    const response = await request(app)
      .get(`/farmers/${farmerId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(farmerId);
  });

  test('devrait mettre à jour un agriculteur existant', async () => {
    // D'abord créer un agriculteur
    const createResponse = await request(app)
      .post('/farmers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Ferme à Modifier',
        description: 'Description initiale',
        address: '123 Rue Test',
        city: 'Paris',
        zip_code: '75001',
        phone: '0123456789',
        user_id: testUser.id,
        latitude: 48.8534,
        longitude: 2.3488
      });

    expect(createResponse.status).toBe(201);
    const farmerId = createResponse.body.id;

    // Mettre à jour l'agriculteur
    const updateResponse = await request(app)
      .put(`/farmers/${farmerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Ferme Modifiée',
        description: 'Nouvelle description',
        address: '456 Rue Test',
        city: 'Paris',
        zip_code: '75002',
        phone: '0987654321'
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Ferme Modifiée');
    expect(updateResponse.body.description).toBe('Nouvelle description');
  });

  test('devrait supprimer un agriculteur existant', async () => {
    // D'abord créer un agriculteur
    const createResponse = await request(app)
      .post('/farmers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Ferme à Supprimer',
        description: 'À supprimer',
        address: '789 Rue Test',
        city: 'Paris',
        zip_code: '75003',
        phone: '0123456789',
        user_id: testUser.id,
        latitude: 48.8534,
        longitude: 2.3488
      });

    expect(createResponse.status).toBe(201);
    const farmerId = createResponse.body.id;

    // Supprimer l'agriculteur
    const deleteResponse = await request(app)
      .delete(`/farmers/${farmerId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteResponse.status).toBe(204);

    // Vérifier que l'agriculteur n'existe plus
    const getResponse = await request(app)
      .get(`/farmers/${farmerId}`);
    expect(getResponse.status).toBe(404);
  });
});

