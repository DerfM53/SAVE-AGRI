// routes/users.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

console.log('Mot de passe dans users.js:', process.env.DB_PASSWORD);

// Configuration de la base de données PostgreSQL (à adapter)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});


// POST /users - Inscription d'un utilisateur
router.post('/', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    console.log('Données reçues par le backend :', { username, password, email });

    // Vérifier si l'utilisateur existe déjà
    const checkUserQuery = `SELECT id FROM users WHERE username = $1 OR email = $2`;
    const existingUser = await pool.query(checkUserQuery, [username, email]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // 1. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Enregistrer l'utilisateur dans la base de données
    const query = `
      INSERT INTO users (username, password, email)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
    `;
    const { rows } = await pool.query(query, [username, hashedPassword, email]);

    // 3. Générer un JWT
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 4. Retourner l'utilisateur créé et le JWT
    res.status(201).json({ user: rows[0], token });
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    res.status(500).send('Erreur serveur');
  }
});

// POST /users/login - Connexion d'un utilisateur
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Récupérer l'utilisateur de la base de données
    const query = `
      SELECT id, username, password
      FROM users
      WHERE username = $1
    `;
    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(401).send('Identifiants invalides');
    }

    // 2. Comparer le mot de passe fourni avec le mot de passe haché stocké
    const passwordMatch = await bcrypt.compare(password, rows[0].password);

    if (!passwordMatch) {
      return res.status(401).send('Identifiants invalides');
    }

    // 3. Générer un JWT
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 4. Retourner le JWT et l'ID de l'utilisateur
    res.json({ token, userId: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
