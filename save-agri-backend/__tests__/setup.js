import { getPool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const setupTestDatabase = async () => {
  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        login_attempts INTEGER DEFAULT 0,
        last_attempt TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        zip_code VARCHAR(20),
        location GEOGRAPHY(Point, 4326),
        phone VARCHAR(20),
        website VARCHAR(255),
        user_id INTEGER REFERENCES users(id),
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        image_url VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        farmer_id INTEGER REFERENCES farmers(id)
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        farmer_id INTEGER REFERENCES farmers(id),
        UNIQUE(user_id, farmer_id)
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        farmer_id INTEGER REFERENCES farmers(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, farmer_id)
      );
    `);
    console.log('✓ Base de données de test initialisée');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données de test:', error);
    throw error;
  }
};

const cleanupTestDatabase = async () => {
  const pool = getPool();
  try {
    await pool.query(`
      TRUNCATE users, farmers, products, favorites, ratings CASCADE;
    `);
    console.log('✓ Nettoyage de la base de données effectué');
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
    throw error;
  }
};

export { setupTestDatabase, cleanupTestDatabase };