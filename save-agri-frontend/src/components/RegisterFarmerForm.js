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
    website: ''
  });
  const [image, setImage] = useState(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImage(file);
      setError('');
    } else {
      setError('Format d\'image invalide. Utilisez JPG ou PNG.');
      e.target.value = '';
    }
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
  
      // Créer un FormData
      const formDataToSend = new FormData();

      console.log("FormData initial:", formDataToSend);

      Object.keys(formData).forEach(key => {
        console.log(`Ajout de ${key}:`, formData[key]);
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('user_id', user.id);
      if (image) {
        console.log("Ajout de l'image:", image);
        formDataToSend.append('image', image);
      }

      console.log("FormData final:", Object.fromEntries(formDataToSend.entries()));

  
      await farmerService.createFarmer(formDataToSend, token);
      
      sessionStorage.setItem('farmerCreationSuccess', 'Producteur créé avec succès !');
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

        <div className="form-section">
          <div className="form-group">
            <label htmlFor="image">Photo de la ferme</label>
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="form-control-file"
            />
            <small className="form-text text-muted">
              Format accepté : JPG ou PNG, taille max : 5MB
            </small>
          </div>
        </div>

        <button type="submit" className="submit-button">S'inscrire comme agriculteur</button>
      </form>
    </div>
  );
}

export default RegisterFarmerForm;