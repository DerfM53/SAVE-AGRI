#!/bin/bash

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction pour afficher les messages d'erreur
error() {
    echo -e "${RED}Erreur: $1${NC}"
    exit 1
}

# Fonction pour afficher les messages de succès
success() {
    echo -e "${GREEN}$1${NC}"
}

# Fonction pour afficher les avertissements
warning() {
    echo -e "${YELLOW}$1${NC}"
}

echo "Installation de Save-Agri..."

# Vérification de Node.js
if ! command -v node &> /dev/null; then
    warning "Node.js n'est pas installé. Installation..."
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash - || error "Échec de l'installation de Node.js"
    sudo apt-get install -y nodejs || error "Échec de l'installation de Node.js"
    success "Node.js installé avec succès"
fi

# Vérification de la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [[ "${NODE_VERSION}" < "14" ]]; then
    error "Node.js version 14 ou supérieure requise. Version actuelle: ${NODE_VERSION}"
fi

# Vérification de PostgreSQL
if ! command -v psql &> /dev/null; then
    warning "PostgreSQL n'est pas installé. Installation..."
    sudo apt-get update || error "Échec de la mise à jour des paquets"
    sudo apt-get install -y postgresql postgresql-contrib || error "Échec de l'installation de PostgreSQL"
    success "PostgreSQL installé avec succès"
fi

# Démarrage de PostgreSQL si nécessaire
if ! pg_isready &> /dev/null; then
    warning "PostgreSQL n'est pas démarré. Démarrage du service..."
    sudo service postgresql start || error "Échec du démarrage de PostgreSQL"
fi

# Configuration de la base de données
echo "Configuration de la base de données..."
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw save_agri; then
    sudo -u postgres psql -c "CREATE USER derfm53 WITH PASSWORD 'votre_mot_de_passe';" || error "Échec de la création de l'utilisateur"
    sudo -u postgres psql -c "CREATE DATABASE save_agri;" || error "Échec de la création de la base de données"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE save_agri TO derfm53;" || error "Échec de l'attribution des privilèges"
    success "Base de données configurée avec succès"
else
    warning "La base de données existe déjà"
fi

# Vérification des fichiers .env.example
if [ ! -f "save-agri-backend/.env.example" ]; then
    error "Fichier save-agri-backend/.env.example manquant"
fi

if [ ! -f "save-agri-frontend/.env.example" ]; then
    error "Fichier save-agri-frontend/.env.example manquant"
fi

# Installation des dépendances backend
echo "Installation des dépendances backend..."
cd save-agri-backend || error "Dossier backend introuvable"
npm install || error "Échec de l'installation des dépendances backend"
cp .env.example .env || error "Échec de la copie du fichier .env"
success "Backend configuré avec succès"

# Installation des dépendances frontend
echo "Installation des dépendances frontend..."
cd ../save-agri-frontend || error "Dossier frontend introuvable"
npm install || error "Échec de l'installation des dépendances frontend"
cp .env.example .env || error "Échec de la copie du fichier .env"
success "Frontend configuré avec succès"

success "Installation terminée avec succès !"
warning "Actions requises :"
echo "1. Configurez vos fichiers .env dans save-agri-backend et save-agri-frontend"
echo "2. Configurez vos credentials Cloudinary dans save-agri-backend/.env"
echo ""
echo "Pour démarrer l'application :"
echo "1. cd save-agri-backend && npm start"
echo "2. Dans un nouveau terminal : cd save-agri-frontend && npm start"