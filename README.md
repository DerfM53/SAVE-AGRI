# Save Agri - Backend

save-agri/
│
│
├── save-agri-backend/
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   ├── farmers.test.js
│   │   ├── login-limit.test.js
│   │   └── setup.js
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── db/
│   │    └── migrations
│   │         └── 001_add_image_to_farmers.sql
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── node_modules/
│   ├── routes/
│   │   ├── farmers.js
│   │   ├── favorites.js
│   │   ├── products.js
│   │   ├── ratings.js
│   │   └── users.js
│   ├── uploads/
│   ├── babelrc
│   ├── .env
│   ├── index.js
│   ├── jest.config.js
│   ├── package-lock.json
│   └── package.json
│
├── save-agri-frontend/
│   ├── node_modules/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.png
│   │   ├── components/
│   │   │   ├── FarmerCard.js
│   │   │   ├── FarmerList.js
│   │   │   ├── FarmerPage.css
│   │   │   ├── FarmerPage.js
│   │   │   ├── HomePage.css
│   │   │   ├── HomePage.js
│   │   │   ├── LoginForm.js
│   │   │   ├── Map.js
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductList.js
│   │   │   ├── RegisterFarmerForm.css
│   │   │   ├── RegisterFarmerForm.js
│   │   │   ├── RegisterForm.js
│   │   │   └── UpdateFarmerFormjs
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── authService.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md


## Description
Save Agri est une application web visant à connecter les agriculteurs locaux avec les consommateurs. Ce dépôt contient le code backend de l'application, gérant l'API et la connexion à la base de données.


## Prérequis
- Node.js (v18.20.6 ou supérieur)
- PostgreSQL
- npm ou yarn

## Installation Rapide

Installation de toutes les dépendances en une seule commande :
```bash
npm run install-all
```

## Configuration

### Variables d'environnement Backend
Créez un fichier `.env` dans le dossier `save-agri-backend` :
```
PORT=3000
DB_USER=votre_utilisateur_postgres
DB_HOST=localhost
DB_NAME=save_agri
DB_PASSWORD=votre_mot_de_passe_postgres
DB_PORT=5432
JWT_SECRET=votre_secret_jwt
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Démarrage Rapide

Pour démarrer les serveurs frontend et backend simultanément :
```bash
npm start
```

Le backend démarrera sur http://localhost:3000
Le frontend démarrera sur http://localhost:3001

## Tests

Lancer tous les tests (backend et frontend) :
```bash
npm test
```

### Tests Backend
Les tests couvrent :
- Authentification et validation des tokens JWT
- Rate limiting et protection contre les attaques par force brute
- Validation des données utilisateur
- Protection contre les injections SQL
- Gestion sécurisée des mots de passe

## Sécurité

L'application implémente plusieurs niveaux de sécurité :
- Authentification JWT avec expiration des tokens
- Protection contre les injections SQL
- Rate limiting sur les tentatives de connexion
- Validation des entrées utilisateur
- Hachage sécurisé des mots de passe avec bcrypt

## API Endpoints

### Authentification
- `POST /users/login` - Connexion
- `POST /users/register` - Inscription
- `POST /users/register/farmer` - Inscription agriculteur

### Agriculteurs
- `GET /farmers` - Liste des agriculteurs
- `GET /farmers/:id` - Détails d'un agriculteur
- `PUT /farmers/:id` - Mise à jour profil agriculteur

### Produits
- `GET /products` - Liste des produits
- `POST /products` - Ajout d'un produit
- `PUT /products/:id` - Mise à jour produit

## Fonctionnalités

### Backend
- Gestion des utilisateurs et authentification
- API RESTful
- Upload et gestion d'images via Cloudinary
- Base de données PostgreSQL
- Tests automatisés

### Frontend
- Interface utilisateur responsive
- Système de recherche et filtrage
- Gestion des favoris
- Carte interactive des agriculteurs
- Formulaires sécurisés

## Technologies Utilisées

### Backend
- Express.js
- PostgreSQL
- JWT
- Bcrypt
- Multer
- Cloudinary

### Frontend
- React.js
- React Router
- Axios
- Leaflet (pour la carte)
- Material-UI

## Contribution

Les contributions sont les bienvenues. Pour contribuer :
1. Créez une branche pour votre fonctionnalité
2. Ajoutez les tests appropriés
3. Mettez à jour la documentation
4. Soumettez une Pull Request

## Licence

[ISC](https://opensource.org/licenses/ISC)