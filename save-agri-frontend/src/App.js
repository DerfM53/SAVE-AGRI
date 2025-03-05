import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import RegisterFarmerForm from './components/RegisterFarmerForm';
import FarmerPage from './components/FarmerPage';
import authService from './services/authService';
import UpdateFarmerForm from './components/UpdateFarmerForm';

import './App.css';

function App() {
  useEffect(() => {
    // Vérifier l'authentification au chargement
    authService.isAuthenticated();
    
    // Configurer les écouteurs d'événements pour suivre l'activité
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click'
    ];
    
    const resetTimer = () => {
      if (authService.isAuthenticated()) {
        // Mettre à jour le temps de dernière activité
        sessionStorage.setItem('lastActivity', Date.now().toString());
        authService.resetInactivityTimer();
      }
    };
    
    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    
    // Ajouter un gestionnaire pour la fermeture de la page
    window.addEventListener('beforeunload', () => {
      // Si vous voulez déconnecter l'utilisateur même s'il revient rapidement,
      // vous pouvez décommenter cette ligne, mais cela va à l'encontre de 
      // l'utilisation de sessionStorage qui est conçu pour persister pendant la session
      // authService.logout();
    });
    
    // Nettoyage des écouteurs d'événements
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/register/farmer" element={<RegisterFarmerForm />} />
          <Route path="/farmers/:id" element={<FarmerPage />} />
          <Route path="/farmer/:id/edit" element={<UpdateFarmerForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


