// routes/products.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import upload from '../middleware/upload.js';  // Notez l'extension .js ajoutée
import cloudinary from 'cloudinary';
const router = express.Router();

// Configuration de Cloudinary
const { v2: cloudinaryV2 } = cloudinary;
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration de la base de données PostgreSQL (à adapter)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// GET /products - Liste des produits
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, farmer_id, name, description, image_url
      FROM products
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// GET /products/:id - Détails d'un produit
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, farmer_id, name, description, image_url
      FROM products
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Produit non trouvé');
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// POST /products - Création d'un produit (avec téléchargement d'image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { farmer_id, name, description } = req.body;

    if (!req.file) {
      return res.status(400).send('Aucun fichier image téléchargé');
    }

    // Télécharger l'image sur Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Récupérer l'URL de l'image téléchargée
    const image_url = result.secure_url;

    // Requête SQL pour insérer le produit
    const query = `
      INSERT INTO products (farmer_id, name, description, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, farmer_id, name, description, image_url
    `;
    const { rows } = await pool.query(query, [farmer_id, name, description, image_url]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// PUT /products/:id - Mise à jour d'un produit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { farmer_id, name, description, image_url } = req.body;

    // Requête SQL pour mettre à jour le produit
    const query = `
      UPDATE products
      SET farmer_id = $1, name = $2, description = $3, image_url = $4
      WHERE id = $5
      RETURNING id, farmer_id, name, description, image_url
    `;
    const { rows } = await pool.query(query, [farmer_id, name, description, image_url, id]);

    if (rows.length === 0) {
      return res.status(404).send('Produit non trouvé');
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// DELETE /products/:id - Suppression d'un produit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Requête SQL pour supprimer le produit
    const query = `
      DELETE FROM products
      WHERE id = $1
      RETURNING id
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Produit non trouvé');
    }

    res.status(204).send(); // 204 No Content - Suppression réussie
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

export default router;
