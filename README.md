# Save Agri - Backend

save-agri/
│
├── save-agri-backend/
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
│   ├── .env
│   ├── index.js
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
│   │   │   └── RegisterForm.js
│   │   ├── services/
│   │   │   └── api.js
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

## Installation

cd save-agri-backend


2. Installez les dépendances :

npm install


3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :

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


4. Initialisez la base de données PostgreSQL :
Créez une base de données nommée `save_agri` et exécutez les scripts SQL nécessaires pour créer les tables.

## Démarrage

Pour lancer le serveur en mode développement :

npm start

Le serveur démarrera sur `http://localhost:3000`.

## Structure du projet

- `index.js` : Point d'entrée de l'application
- `routes/` : Contient les fichiers de routes pour chaque entité (farmers, users, products, favorites, ratings)
- `middleware/` : Contient les middlewares d'authentification et d'upload de fichiers
- `uploads/` : Dossier temporaire pour le stockage des fichiers uploadés

## Fonctionnalités principales

- Inscription et connexion des utilisateurs
- Gestion des agriculteurs et de leurs produits
- Système de favoris et de notations
- Upload et gestion d'images via Cloudinary

## Technologies utilisées

- Express.js : Framework web
- PostgreSQL : Base de données
- JSON Web Token (JWT) : Authentification
- Bcrypt : Hachage des mots de passe
- Multer : Gestion des uploads de fichiers
- Cloudinary : Stockage et gestion des images

---

# Save Agri - Frontend

## Description du Frontend
Le frontend de Save Agri est une application web qui permet aux utilisateurs d'interagir avec l'API backend, de s'inscrire, de se connecter, et d'explorer les produits des agriculteurs locaux.

## Prérequis pour le Frontend
- Node.js (v18.20.6 ou supérieur)
- npm ou yarn

## Installation du Frontend


2. Installez les dépendances :

npm install


3. Configurez les variables d'environnement si nécessaire.

## Démarrage du Frontend

Pour lancer le frontend en mode développement :

npm start ou yarn start


Le frontend démarrera sur `http://localhost:3000` (ou un autre port si configuré).

## Fonctionnalités principales du Frontend

- Interface utilisateur pour l'inscription et la connexion des utilisateurs.
- Affichage des produits des agriculteurs.
- Fonctionnalités de recherche et de filtrage.
- Système de favoris pour que les utilisateurs puissent enregistrer leurs produits préférés.

---

## Contribution

Les contributions sont les bienvenues. Veuillez ouvrir une issue pour discuter des modifications majeures que vous souhaitez apporter.

## Licence

[ISC](https://opensource.org/licenses/ISC)



