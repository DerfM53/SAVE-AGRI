import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/users', { username, password, email });
      // Afficher un message de succès à l'utilisateur
      alert('Inscription réussie ! Bienvenue, ' + response.data.user.username + ' !');
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error);
      if (error.response) {
        setError(error.response.data.message || 'Erreur lors de l\'inscription.');
      } else if (error.request) {
        setError('Aucune réponse du serveur.');
      } else {
        setError('Erreur lors de l\'inscription.');
      }
    }
  };

  return (
    <div>
      <h2>Inscription Utilisateur</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Nom d'utilisateur :</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Mot de passe :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default RegisterForm;


