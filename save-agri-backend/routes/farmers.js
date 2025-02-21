import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import fetch from 'node-fetch';
import authenticateToken from '../middleware/auth.js';
import dotenv from 'dotenv';

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

// GET /farmers - Liste des producteurs (avec recherche géographique)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { city, radius } = req.query;

    // Utilisation de l'API Nominatim pour obtenir les coordonnées de la ville
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${city}&format=json`;
    const nominatimResponse = await fetch(nominatimUrl);
    const nominatimData = await nominatimResponse.json();

    if (nominatimData.length === 0) {
      return res.status(404).send('Ville non trouvée');
    }

    const latitude = nominatimData[0].lat;
    const longitude = nominatimData[0].lon;

    // Requête SQL avec PostGIS pour la recherche géographique
    const query = `
      SELECT id, name, description, address, city, zip_code, ST_AsGeoJSON(location) AS location, phone, website
      FROM farmers
      WHERE ST_DWithin(location, ST_MakePoint(longitude, latitude)::geography, radius);
    `;

    const { rows } = await pool.query(query, [longitude, latitude, radius]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// GET /farmers/:id - Détails d'un producteur
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, name, description, address, city, zip_code, ST_AsGeoJSON(location) AS location, phone, website
      FROM farmers
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Producteur non trouvé');
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// POST /farmers - Création d'un producteur
router.post('/', async (req, res) => {
  try {
    const { name, description, address, city, zip_code, longitude, latitude, phone, website, userId } = req.body;

    // Requête SQL pour insérer le producteur
    const query = `
      INSERT INTO farmers (name, description, address, city, zip_code, location, phone, website, user_id)
      VALUES ($1, $2, $3, $4, $5, ST_MakePoint($6, $7), $8, $9, $10)
      RETURNING id, name, description, address, city, zip_code, ST_AsGeoJSON(location) AS location, phone, website, user_id
    `;
    const { rows } = await pool.query(query, [name, description, address, city, zip_code, longitude, latitude, phone, website, userId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// PUT /farmers/:id - Mise à jour d'un producteur
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, city, zip_code, longitude, latitude, phone, website } = req.body;

    // Requête SQL pour mettre à jour le producteur
    const query = `
      UPDATE farmers
      SET name = $1, description = $2, address = $3, city = $4, zip_code = $5, location = ST_MakePoint($6, $7), phone = $8, website = $9
      WHERE id = $10
      RETURNING id, name, description, address, city, zip_code, ST_AsGeoJSON(location) AS location, phone, website
    `;
    const { rows } = await pool.query(query, [name, description, address, city, zip_code, longitude, latitude, phone, website, id]);

    if (rows.length === 0) {
      return res.status(404).send('Producteur non trouvé');
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE /farmers/:id - Suppression d'un producteur
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Requête SQL pour supprimer le producteur
    const query = `
      DELETE FROM farmers
      WHERE id = $1
      RETURNING id
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Producteur non trouvé');
    }

    res.status(204).send(); // 204 No Content - Suppression réussie
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
