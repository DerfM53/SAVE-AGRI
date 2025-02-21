import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

// Ajoutez ces lignes pour déboguer
console.log('Valeurs des variables d\'environnement :');
console.log({
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  // DB_PASSWORD: "***", // On masque le mot de passe
  DB_PORT: process.env.DB_PORT
});


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuration de la base de données PostgreSQL

console.log('Mot de passe utilisé pour la connexion DB:', process.env.DB_PASSWORD);


const pool = new Pool({
  connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

// Test de la connexion à la base de données
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur de connexion à la base de données', err);
  } else {
    console.log('Connexion à la base de données réussie', res.rows);
  }
});

// Import des routes
import farmersRoutes from './routes/farmers.js';
import usersRoutes from './routes/users.js';
import productsRoutes from './routes/products.js';
import favoritesRoutes from './routes/favorites.js';
import ratingsRoutes from './routes/ratings.js';

// Utilisation des routes comme middlewares
app.use('/farmers', farmersRoutes);
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/ratings', ratingsRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API Save Agri !');
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
