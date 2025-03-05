// save-agri-frontend/src/services/api.js
import axios from 'axios';
import authService from './authService';

// Configuration de l'URL de base pour les requêtes API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Configuration de l'intercepteur axios pour ajouter le token d'authentification
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
axios.interceptors.response.use(
  (response) => {
    // Réinitialiser le timer d'inactivité à chaque réponse réussie
    if (authService.isAuthenticated()) {
      authService.resetInactivityTimer();
    }
    return response;
  },
  (error) => {
    // Si l'erreur est 401 (non autorisé), déconnexion
    if (error.response && error.response.status === 401) {
      authService.logout();
    }
    return Promise.reject(error);
  }
);

// Service pour les opérations liées aux utilisateurs
const userService = {
  // Inscription
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  },

  // Connexion
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, credentials);
      console.log('Réponse du backend:', response.data);
      // Vérifier que response.data est défini
      if (response.data && response.data.token && response.data.userId) {
        const token = response.data.token;
        const userData = {
          id: response.data.userId, 
        username: credentials.username
      };
      authService.login(userData, token);
      if (token) {
        // Appeler la méthode login du service d'authentification
        authService.login(userData, token);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
},

  // Déconnexion
  logout: () => {
    authService.logout();
  },

  // Récupérer le profil de l'utilisateur
  getUserProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }
};

// Service pour les opérations liées aux farmers
const farmerService = {
  // Recherche par localisation (ville)
  searchByLocation: async (city, radius = 50) => {
    try {
      console.log(`Recherche des producteurs près de ${city} dans un rayon de ${radius}km`);
      const response = await axios.get(`${API_URL}/farmers`, {
        params: { city, radius }
      });
      console.log('Résultats de la recherche:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche par localisation:', error);
      throw error;
    }
  },

  // Recherche par coordonnées GPS
  searchByCoordinates: async (latitude, longitude, radius = 50) => {
    try {
      console.log(`Recherche des producteurs aux coordonnées [${latitude}, ${longitude}] dans un rayon de ${radius}km`);
      const response = await axios.get(`${API_URL}/farmers/coordinates`, {
        params: { latitude, longitude, radius }
      });
      console.log('Résultats de la recherche par coordonnées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche par coordonnées:', error);
      throw error;
    }
  },

  // Récupérer les détails d'un producteur
  getFarmer: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/farmers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du producteur ${id}:`, error);
      throw error;
    }
  },  

  // Créer un nouveau producteur
  createFarmer: async (farmerData) => {
    try {
      console.log("Création d'un nouveau producteur avec les données:", farmerData);
      if (farmerData.photo) {
        const formData = new FormData();
        
        // Ajouter tous les champs à FormData
        Object.keys(farmerData).forEach(key => {
          formData.append(key, farmerData[key]);
        });
        
        const response = await axios.post(`${API_URL}/farmers`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
            // Le token sera ajouté par l'intercepteur
          }
        });
        return response.data;
      } else {
        // Si pas de fichier, envoyer comme JSON normal
        const response = await axios.post(`${API_URL}/farmers`, farmerData);
        return response.data;
      }
    } catch (error) {
      console.error('Erreur lors de la création du producteur:', error);
      throw error;
    }
  },

  // Mettre à jour un producteur
  updateFarmer: async (id, farmerData) => {
    try {
      const response = await axios.put(`${API_URL}/farmers/${id}`, farmerData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du producteur ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un producteur
  deleteFarmer: async (id) => {
    try {
      await axios.delete(`${API_URL}/farmers/${id}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du producteur ${id}:`, error);
      throw error;
    }
  }
};

export { farmerService, userService };