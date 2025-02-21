// routes/favorites.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

// Configuration de la base de données PostgreSQL (à adapter)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// GET /users/:id/favorites - Liste des producteurs favoris d'un utilisateur
router.get('/users/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT f.id, f.name, f.description, f.address, f.city, f.zip_code, ST_AsGeoJSON(f.location) AS location, f.phone, f.website
      FROM farmers f
      INNER JOIN favorites fav ON f.id = fav.farmer_id
      WHERE fav.user_id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// POST /users/:id/favorites - Ajouter un producteur aux favoris d'un utilisateur
router.post('/users/:id/favorites', async (req, res) => {
  try {
    const { id } = req.params;
    const { farmerId } = req.body;

    // Requête SQL pour ajouter le producteur aux favoris
    const query = `
      INSERT INTO favorites (user_id, farmer_id)
      VALUES ($1, $2)
    `;
    await pool.query(query, [id, farmerId]);

    res.status(201).send('Producteur ajouté aux favoris');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE /users/:id/favorites/:farmerId - Supprimer un producteur des favoris d'un utilisateur
router.delete('/users/:id/favorites/:farmerId', async (req, res) => {
  try {
    const { id, farmerId } = req.params;

    // Requête SQL pour supprimer le producteur des favoris
    const query = `
      DELETE FROM favorites
      WHERE user_id = $1 AND farmer_id = $2
    `;
    await pool.query(query, [id, farmerId]);

    res.status(204).send(); // 204 No Content - Suppression réussie
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
