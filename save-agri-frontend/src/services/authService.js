// save-agri-frontend/src/services/authService.js
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

let inactivityTimer = null;
let tokenExpiryTimer = null;

const authService = {
  login: (userData, token) => {
    console.log("Données utilisateur complètes:", userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    authService.startInactivityTimer();
  },

  logout: () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    authService.clearTimers();
  },

  startInactivityTimer: () => {
    authService.resetInactivityTimer();
    // Ajouter l'écouteur d'événements pour réinitialiser le timer
    document.addEventListener('mousemove', authService.resetInactivityTimer);
  },

  // Ajout de la méthode resetInactivityTimer
  resetInactivityTimer: () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(() => {
      authService.logout();
    }, INACTIVITY_TIMEOUT);
  },

  clearTimers: () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      document.removeEventListener('mousemove', authService.resetInactivityTimer);
    }
    if (tokenExpiryTimer) {
      clearTimeout(tokenExpiryTimer);
    }
  },

  isAuthenticated: () => {
    const token = sessionStorage.getItem('token');
    return !!token;
  },

  getToken: () => {
    return sessionStorage.getItem('token');
  },

  getCurrentUser() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    console.log('Utilisateur actuel:', user);
    return user ? { ...user, id: user.id } : null;
  }
};

export default authService;