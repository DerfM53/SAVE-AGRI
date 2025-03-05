import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerService } from '../services/api';
import authService from '../services/authService';
import './RegisterFarmerForm.css';

function RegisterFarmerForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    zip_code: '',
    phone: '',
    website: '',
    photo: null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const token = sessionStorage.getItem('token');
    if (!user || !token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    
    try {
      const user = authService.getCurrentUser();
      const token = authService.getToken();
  
      if (!user || !token) {
        throw new Error('Utilisateur non connecté');
      }

      const farmerDataWithUserId = {
        ...formData,
        user_id: user.id // Assurez-vous que l'ID de l'utilisateur est inclus
      };  

      await farmerService.createFarmer(farmerDataWithUserId, token);
      
      // Stocker le message de succès dans sessionStorage
      sessionStorage.setItem('farmerCreationSuccess', 'Producteur créé avec succès !');
      
      // Redirection vers la HomePage
      navigate('/');
      
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login');
        setError("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        setError("Erreur lors de la création du profil agriculteur: " + (error.response?.data?.message || error.message));
      }
    }
  };
  
  return (
    <div className="register-farmer-container">
      <h1>Inscription Agriculteur</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="register-farmer-form">
        <div className="form-section">
          <h2>Informations de la Ferme</h2>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nom de la ferme" required />
         
          <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Adresse" required />
          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Ville" required />
          <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="Code Postal" required />
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description de la ferme" required />
          <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="Site Web" />
        </div>

        <button type="submit" className="submit-button">S'inscrire comme agriculteur</button>
      </form>
    </div>
  );
}

export default RegisterFarmerForm;