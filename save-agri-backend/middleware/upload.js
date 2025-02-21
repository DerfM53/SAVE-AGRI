import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: 'uploads/', // Dossier de stockage temporaire des fichiers
  filename: (req, file, cb) => {
    // Génération d'un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtrage des types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error('Type de fichier non autorisé'), false); // Rejeter le fichier
  }
};

// Création du middleware d'upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite de taille des fichiers à 5 Mo
  }
});

export default upload;
