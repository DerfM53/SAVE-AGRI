import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '../services/api';
import './LoginForm.css';

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await userService.login(formData);
      
      if (response && response.token) {
        // Stockage des informations de session
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify({
          username: formData.username,
          id: response.userId
        }));
        
        // Retour à la page précédente ou à la racine
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur de connexion', error);
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="login-container">
      <h1>Connexion</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Nom d'utilisateur"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mot de passe"
          required
        />
        <button type="submit">Se connecter</button>
      </form>
        <div className="register-link">
          <p>Pas encore de compte ?</p>
          <Link to="/register">Créer un compte utilisateur</Link>
      </div>
    </div>
  );
}

export default LoginForm;