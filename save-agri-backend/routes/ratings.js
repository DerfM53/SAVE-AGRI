// routes/ratings.js
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

// POST /ratings - Création d'un avis
router.post('/', async (req, res) => {
  try {
    const { userId, farmerId, rating, comment } = req.body;

    // Requête SQL pour insérer l'avis
    const query = `
      INSERT INTO ratings (user_id, farmer_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, farmer_id, rating, comment, created_at
    `;
    const { rows } = await pool.query(query, [userId, farmerId, rating, comment]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// PUT /ratings/:id - Mise à jour d'un avis
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Requête SQL pour mettre à jour l'avis
    const query = `
      UPDATE ratings
      SET rating = $1, comment = $2
      WHERE id = $3
      RETURNING id, user_id, farmer_id, rating, comment, created_at
    `;
    const { rows } = await pool.query(query, [rating, comment, id]);

    if (rows.length === 0) {
      return res.status(404).send('Avis non trouvé');
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE /ratings/:id - Suppression d'un avis
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Requête SQL pour supprimer l'avis
    const query = `
      DELETE FROM ratings
      WHERE id = $1
      RETURNING id
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Avis non trouvé');
    }

    res.status(204).send(); // 204 No Content - Suppression réussie
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
