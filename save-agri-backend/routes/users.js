// routes/users.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: { 
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

const validatePassword = (password) => {
  // Au moins 8 caractères
  // Au moins une majuscule
  // Au moins une minuscule
  // Au moins un chiffre
  // Au moins un caractère spécial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};:'",.<>/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};:'",.<>/?]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
    };
  }
  
  return { isValid: true };
};

const validateUserData = (userData) => {
  const { username, password, email } = userData;

  // Validation du nom d'utilisateur
  if (!username || username.length < 3) {
    return {
      isValid: false,
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères"
    };
  }
  
  // Validation du mot de passe
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  // Validation de l'adresse email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      message: "L'adresse email n'est pas valide"
    };
  }

  return { isValid: true };
};

dotenv.config();

const router = express.Router();

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
    console.log('Tentative de création utilisateur:', { username, email });

    // Validation des données
    const validation = validateUserData({ username, password, email });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    // Vérifier si l'utilisateur existe déjà (séparément pour username et email)
    const checkUserQuery = `SELECT id, username, email FROM users WHERE username = $1 OR email = $2`;
    const existingUser = await pool.query(checkUserQuery, [username, email]);
    console.log('Vérification utilisateur existant:', existingUser.rows);
    
    if (existingUser.rows.length > 0) {
      const exists = existingUser.rows[0];
      if (exists.username === username) {
        return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé" });
      }
      if (exists.email === email) {
        return res.status(409).json({ message: "Adresse email déjà utilisée" });
      }
    }

    // Créer le nouvel utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (username, password, email)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
    `;
    const { rows } = await pool.query(insertQuery, [username, hashedPassword, email]);

    // Générer le token
    const token = jwt.sign(
      { 
        userId: rows[0].id,
        username: rows[0].username,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de l\'inscription :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /users/login - Connexion d'un utilisateur
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation des entrées
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Données invalides' });
    }

    // Limite la longueur des entrées
    if (username.length > 50 || password.length > 100) {
      return res.status(400).json({ message: 'Données invalides' });
    }

    // Utilisation de requêtes préparées avec message d'erreur générique
    const query = `
      SELECT id, username, password
      FROM users
      WHERE username = $1
    `;
    const { rows } = await pool.query(query, [username]);

    // Message d'erreur générique pour ne pas indiquer si l'utilisateur existe
    if (rows.length === 0 || !await bcrypt.compare(password, rows[0].password)) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { 
        userId: rows[0].id,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      userId: rows[0].id
    });
  } catch (err) {
    console.error('Erreur de connexion:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { validatePassword, validateUserData };
router.loginLimiter = loginLimiter;
export default router;
