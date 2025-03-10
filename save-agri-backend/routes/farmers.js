// save-agri-backend/routes/farmers.js
import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import fetch from 'node-fetch';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';
import upload from '../middleware/upload.js';

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

async function geocodeAddress(address, city, zip_code) {
  if (!address || !city || !zip_code) {
    console.error('Données d\'adresse manquantes:', { address, city, zip_code });
    throw new Error('Données d\'adresse incomplètes');
  }

  const query = encodeURIComponent(`${address}, ${city}, ${zip_code}, France`);
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  console.log('URL de requête Nominatim:', nominatimUrl);

  try {
    const response = await fetch(nominatimUrl);
    const data = await response.json();
    console.log('Réponse de Nominatim:', data);

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } else {
      // Si l'adresse complète n'est pas trouvée, essayez avec juste la ville et le code postal
      const fallbackQuery = encodeURIComponent(`${city}, ${zip_code}, France`);
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${fallbackQuery}&limit=1`;

      console.log('URL de requête Nominatim (fallback):', fallbackUrl);

      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      console.log('Réponse de Nominatim (fallback):', fallbackData);

      if (fallbackData.length > 0) {
        return {
          latitude: parseFloat(fallbackData[0].lat),
          longitude: parseFloat(fallbackData[0].lon)
        };
      }
    }
    throw new Error('Adresse non trouvée');
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    throw error;
  }
}


// GET /farmers - Liste des producteurs (avec recherche géographique)
router.get('/', async (req, res) => {
  console.log('Requête reçue pour la recherche des agriculteurs');
  console.log('Paramètres de recherche:', req.query);
  try {
    console.log("Requête reçue avec paramètres:", req.query);
    const { city, radius } = req.query;
    
    if (!city) {
      return res.status(400).json({ message: 'Le paramètre "city" est requis' });
    }

    // Utilisation de l'API Nominatim pour obtenir les coordonnées de la ville
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    console.log("URL Nominatim:", nominatimUrl);
    
    const nominatimResponse = await fetch(nominatimUrl);
    const nominatimData = await nominatimResponse.json();
    console.log("Réponse Nominatim:", nominatimData);

    if (nominatimData.length === 0) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }

    const latitude = parseFloat(nominatimData[0].lat);
    const longitude = parseFloat(nominatimData[0].lon);
    console.log(`Coordonnées trouvées: Lat ${latitude}, Long ${longitude}`);

    const radiusInMeters = parseFloat(radius || 50) * 1000; // Valeur par défaut: 50km
    console.log(`Rayon de recherche: ${radiusInMeters} mètres`);

    // Vérifier si la table contient des producteurs
    const countQuery = "SELECT COUNT(*) FROM farmers";
    const countResult = await pool.query(countQuery);
    console.log("Nombre total de producteurs en base:", countResult.rows[0].count);

    // Requête SQL avec PostGIS pour la recherche géographique
    const query = `
      SELECT id, name, description, address, city, zip_code, 
             phone, website, user_id, latitude, longitude,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude),
               ST_MakePoint($1, $2)
             ) as distance
      FROM farmers
      WHERE ST_DistanceSphere(
        ST_MakePoint(longitude, latitude),
        ST_MakePoint($1, $2)
      ) <= $3
      ORDER BY distance ASC;
    `;

    console.log("Exécution de la requête SQL:", query);
    console.log("Paramètres:", [longitude, latitude, radiusInMeters]);

    const { rows } = await pool.query(query, [longitude, latitude, radiusInMeters]);
    console.log(`Nombre de résultats trouvés: ${rows.length}`);
    
    // Ajouter les coordonnées au format attendu par le frontend
    const formattedRows = rows.map(row => ({
      ...row,
      distance: Math.round(row.distance / 1000 * 10) / 10, // Convert to km with 1 decimal
      location: {
        type: "Point",
        coordinates: [row.longitude, row.latitude]
      }
    }));
    console.log(`Recherche effectuée pour la ville ${city} dans un rayon de ${radius}km`);
    res.json(formattedRows);
  } catch (err) {
    console.error("Erreur dans la recherche de producteurs:", err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /farmers/coordinates - Recherche par coordonnées directes
router.get('/coordinates', async (req, res) => {
  try {
    console.log("Requête de recherche par coordonnées reçue:", req.query);
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Les paramètres "latitude" et "longitude" sont requis' });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const radiusInMeters = parseFloat(radius || 50) * 1000; // Valeur par défaut: 50km

    console.log(`Recherche autour de: Lat ${lat}, Long ${lon}, Rayon: ${radiusInMeters}m`);

    // Requête SQL avec PostGIS pour la recherche géographique
    const query = `
      SELECT id, name, description, address, city, zip_code, 
             phone, website, user_id, latitude, longitude,
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude),
               ST_MakePoint($1, $2)
             ) as distance
      FROM farmers
      WHERE ST_DistanceSphere(
        ST_MakePoint(longitude, latitude),
        ST_MakePoint($1, $2)
      ) <= $3
      ORDER BY distance ASC;
    `;

    const { rows } = await pool.query(query, [lon, lat, radiusInMeters]);
    console.log(`Nombre de résultats trouvés: ${rows.length}`);
    
    // Ajouter les coordonnées au format attendu par le frontend
    const formattedRows = rows.map(row => ({
      ...row,
      distance: Math.round(row.distance / 1000 * 10) / 10, // Convert to km with 1 decimal
      location: {
        type: "Point",
        coordinates: [row.longitude, row.latitude]
      }
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error("Erreur dans la recherche par coordonnées:", err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /farmers/:id - Détails d'un producteur
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, name, description, address, city, zip_code, 
             latitude, longitude, phone, website, user_id, image_url
      FROM farmers
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Producteur non trouvé');
    }

    // Ajouter les coordonnées au format attendu par le frontend
    const farmer = {
      ...rows[0],
      location: {
        type: "Point",
        coordinates: [rows[0].longitude, rows[0].latitude]
      }
    };

    console.log('Données du farmer envoyées:', farmer);
    res.json(farmer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

// POST /farmers - Création d'un producteur
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Fichier reçu:', req.file);
    console.log('Corps de la requête:', req.body);
    const { name, description, address, city, zip_code, phone, website } = req.body;
    const userId = req.user.userId;

    console.log('Données reçues:', { name, description, address, city, zip_code, phone, website });
    console.log('UserId from token:', userId);

    // Vérifier si l'utilisateur existe
    const userQuery = `SELECT id FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [userId]);

    console.log('Requête SQL pour vérifier l\'utilisateur:', userQuery);
    console.log('Paramètres de la requête:', [userId]);
    console.log('Résultat de la requête utilisateur:', userResult.rows);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "L'utilisateur n'existe pas." });
    }

    // Géocodage de l'adresse
    let coordinates;
    try {
      coordinates = await geocodeAddress(address, city, zip_code);
      console.log("Coordonnées obtenues:", coordinates);
    } catch (err) {
      console.error('Erreur complète:', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err.message, stack: err.stack });
    }

    // Ajouter l'URL de l'image si elle a été uploadée
    const image_url = req.file ? req.file.path : null;

    // Modifier la requête SQL pour inclure image_url
    const query = `
      INSERT INTO farmers (name, description, address, city, zip_code, phone, website, user_id, latitude, longitude, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, description, address, city, zip_code, phone, website, user_id, latitude, longitude, image_url
    `;
    const values = [
      name, description, address, city, zip_code, phone, website, 
      userId, coordinates.latitude, coordinates.longitude, image_url
    ];

    console.log('Requête SQL pour insérer le farmer:', query);
    console.log('Valeurs pour l\'insertion:', values);

    const { rows } = await pool.query(query, values);

    console.log('Résultat de l\'insertion:', rows[0]);

    // Ajouter les coordonnées au format attendu par le frontend
    const farmer = {
      ...rows[0],
      location: {
        type: "Point",
        coordinates: [rows[0].longitude, rows[0].latitude]
      }
    };

    res.status(201).json(farmer);
  } catch (err) {
    console.error('Erreur complète:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /farmers/:id - Mise à jour d'un producteur
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, city, zip_code, phone, website } = req.body;

    // Géocodage de l'adresse si elle a été modifiée
    let latitude, longitude;
    if (address && city && zip_code) {
      const coordinates = await geocodeAddress(address, city, zip_code);
      latitude = coordinates.latitude;
      longitude = coordinates.longitude;
    }

    // Obtenir l'URL de l'image si une nouvelle image a été uploadée
    const image_url = req.file ? req.file.path : undefined;

    // Construction dynamique de la requête SQL
    let updateFields = [
      'name = $1',
      'description = $2',
      'address = $3',
      'city = $4',
      'zip_code = $5',
      'phone = $6',
      'website = $7'
    ];
    
    const values = [
      name, description, address, city, zip_code, phone, website
    ];

    let paramCount = values.length;

    if (latitude !== undefined && longitude !== undefined) {
      updateFields.push(`latitude = $${paramCount + 1}`);
      updateFields.push(`longitude = $${paramCount + 2}`);
      values.push(latitude, longitude);
      paramCount += 2;
    }

    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount + 1}`);
      values.push(image_url);
      paramCount += 1;
    }

    values.push(id); // Ajout de l'ID à la fin des valeurs

    const query = `
      UPDATE farmers
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING id, name, description, address, city, zip_code, phone, website, user_id, latitude, longitude, image_url
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producteur non trouvé' });
    }

    // Ajouter les coordonnées au format attendu par le frontend
    const farmer = {
      ...rows[0],
      location: {
        type: "Point",
        coordinates: [rows[0].longitude, rows[0].latitude]
      }
    };

    res.json(farmer);
  } catch (err) {
    console.error('Erreur lors de la mise à jour:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
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