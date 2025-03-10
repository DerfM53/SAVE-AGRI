import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerService } from '../services/api';
import authService from '../services/authService';
import './RegisterFarmerForm.css'; // Réutiliser les styles

function UpdateFarmerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [image, setImage] = useState(null);

  // Vérifier l'authentification
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  // Charger les données du farmer
  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        console.log('Début fetchFarmer, id:', id);
        const farmerData = await farmerService.getFarmer(id);
        console.log('Données farmer reçues:', farmerData);
        
        // Vérifier si l'utilisateur actuel est le propriétaire
        const currentUser = authService.getCurrentUser();
        console.log('Vérification propriétaire:', {
          currentUserId: currentUser?.id,
          farmerUserId: farmerData?.user_id,
          isMatch: String(currentUser?.id) === String(farmerData?.user_id)
        });

        if (!currentUser || !farmerData) {
          throw new Error('Données utilisateur ou farmer manquantes');
        }

        if (String(currentUser.id) !== String(farmerData.user_id)) {
          console.log('Non autorisé: IDs ne correspondent pas');
          navigate('/');
          return;
        }

        setFormData(farmerData);
      } catch (error) {
        console.error('Erreur de chargement:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id, navigate]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!formData) return <div>Aucune donnée trouvée</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const formDataToSend = new FormData();
      
      // Ajouter toutes les données du formulaire
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Ajouter la nouvelle image si elle existe
      if (image) {
        formDataToSend.append('image', image);
      }

      await farmerService.updateFarmer(id, formDataToSend);
      setSuccess('Modifications enregistrées avec succès !');
      setTimeout(() => navigate(`/farmers/${id}`), 1500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="register-farmer-container">
      <h2>Modifier les informations</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="register-farmer-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="name">Nom :</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description :</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse :</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">Ville :</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="zip_code">Code postal :</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone :</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="website">Site web :</label>
            <input
              type="url"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Nouvelle photo de la ferme (optionnel)</label>
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
          {formData.image_url && (
            <div>
              <p>Image actuelle :</p>
              <img 
                src={formData.image_url} 
                alt="Ferme actuelle" 
                style={{maxWidth: '200px', marginTop: '10px'}}
              />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

export default UpdateFarmerForm;