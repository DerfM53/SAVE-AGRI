import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

let pool = null;

export const getPool = () => {
  if (!pool) {
    if (process.env.NODE_ENV === 'test') {
      console.log('Chargement de la configuration de test');
      dotenv.config({ path: '.env.test' });
    } else {
      dotenv.config();
    }

    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.NODE_ENV === 'test' ? 'save_agri_test' : process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    pool.on('error', (err) => {
      console.error('Erreur inattendue du pool:', err);
    });
  }
  return pool;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};