import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import axios from 'axios';
import { farmerService } from '../services/api';
import authService from '../services/authService';
import FarmerList from './FarmerList';
import Map from './Map';
import './HomePage.css';

function HomePage() {
  const [city, setCity] = useState('');
  const [useGeolocation, setUseGeolocation] = useState(false);
  const [radius, setRadius] = useState('50');
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [username, setUsername] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Utiliser authService pour récupérer l'utilisateur
    const user = authService.getCurrentUser();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const handleLogout = () => {
    // Utiliser authService pour la déconnexion
    authService.logout();
    setUsername('');
    navigate('/');
  };

  const handleGeolocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            if (response.data && response.data.address) {
              const address = response.data.address;
              const location = address.city || address.town || address.village || address.hamlet;
              setCity(location);
            }
          } catch (error) {
            console.error("Erreur lors de la géolocalisation inversée:", error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setError("Impossible d'obtenir votre position. Veuillez entrer une ville manuellement.");
          setLoading(false);
          setUseGeolocation(false);
        }
      );
    } else {
      setError("La géolocalisation n'est pas prise en charge par votre navigateur.");
      setUseGeolocation(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      let searchResults;
      if (useGeolocation && coordinates) {
        searchResults = await farmerService.searchByCoordinates(
          coordinates.latitude,
          coordinates.longitude,
          radius
        );
      } else if (city) {
        searchResults = await farmerService.searchByLocation(city, radius);
      } else {
        setError("Veuillez entrer une ville ou activer la géolocalisation.");
        return;
      }

      if (searchResults && Array.isArray(searchResults)) {
        setFarmers(searchResults);
        if (searchResults.length === 0) {
          setError("Aucun agriculteur trouvé dans cette zone.");
        }
      } else {
        throw new Error("Format de données incorrect.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      setError(`Erreur lors de la recherche: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [city, radius, coordinates, useGeolocation]);

  useEffect(() => {
    if (useGeolocation) {
      handleGeolocation();
    } else {
      setCoordinates(null);
      setCity('');
    }
  }, [useGeolocation, handleGeolocation]);

  return (
    <div className="home-page">
      {username && (
        <div className="user-greeting">
          {username} : Connecté
        </div>
      )}

      <img src={logo} alt="Logo Save Agri" className="logo" />

      <div className="search-container">
        <h2>Trouvez des producteurs locaux près de chez vous</h2>
        {error && <div className="error-message">{error}</div>}
        <div>
          <label htmlFor="city">Ville:</label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={useGeolocation}
            className="input-style"
            placeholder="Entrez une ville"
          />
        </div>
        <div>
          <label htmlFor="radius">Rayon (km):</label>
          <input
            type="number"
            id="radius"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="input-style"
            placeholder="Entrez un rayon en km"
          />
        </div>
        <div className="geolocation-option">
          <label htmlFor="useGeolocation">Utiliser ma position actuelle</label>
          <input
            type="checkbox"
            id="useGeolocation"
            checked={useGeolocation}
            onChange={(e) => setUseGeolocation(e.target.checked)}
          />
        </div>
        <button onClick={handleSearch} className="search-button" disabled={loading}>
          {loading ? 'Recherche en cours...' : 'Rechercher'}
        </button>
      </div>

      {farmers.length > 0 && (
        <div className="farmers-list">
          <Map farmers={farmers} />
          <FarmerList farmers={farmers} />
        </div>
      )}

      <div className="account-links">
      {username ? (
        <div className="button-group">
          <span className="user-greeting">Bonjour, {username}</span>
          <Link to="/register/farmer" className="button farmer-button">Créer un compte producteur</Link>
          <button onClick={handleLogout} className="button logout-button">Se déconnecter</button>
        </div>
    ) : (
      <div className="button-group">
        <Link to="/login" className="button login-button">Se connecter</Link>
      </div>
    )}
      </div>
    </div>
  );
}

export default HomePage;
