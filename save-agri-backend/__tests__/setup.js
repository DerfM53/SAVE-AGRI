import { getPool, closePool } from '../config/database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Charger les variables d'environnement de test
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
}

export const setupTestDatabase = async () => {
  const pool = getPool();
  try {
    const postgisCheck = await pool.query(`
      SELECT 1 FROM pg_extension WHERE extname = 'postgis';
    `);

    if (postgisCheck.rows.length === 0) {
      console.warn('⚠️ PostGIS n\'est pas installé. Certaines fonctionnalités peuvent ne pas fonctionner.');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(255),
        city VARCHAR(100),
        zip_code VARCHAR(10),
        phone VARCHAR(20),
        website VARCHAR(255),
        user_id INTEGER REFERENCES users(id),
        latitude DECIMAL,
        longitude DECIMAL,
        geom geometry(Point, 4326)
      );
    `);

    const hashedPassword = await bcrypt.hash('Test123@', 10);
    const userResult = await pool.query(`
      INSERT INTO users (username, password, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO UPDATE 
      SET password = $2, email = $3
      RETURNING id
    `, ['test_user', hashedPassword, 'test@example.com']);
    
    console.log('✓ Base de données de test initialisée');
    return userResult.rows[0];
  } catch (error) {
    console.error('✗ Erreur setup:', error);
    throw error;
  }
};

export const cleanupTestDatabase = async () => {
  const pool = getPool();
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM farmers');
    await pool.query('DELETE FROM users');
    await pool.query('COMMIT');
    console.log('✓ Nettoyage de la base de données effectué');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors du nettoyage de la base de données:', err);
    throw err;
  }
};

// Fonction de teardown global
export default async () => {
  try {
    await cleanupTestDatabase();
  } finally {
    await closePool();
  }
};