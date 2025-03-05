import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerService } from '../services/api';
import authService from '../services/authService';

function UpdateFarmerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await farmerService.updateFarmer(id, formData);
      setSuccess('Modifications enregistrées avec succès !');
      // Attendre un court instant pour montrer le message de succès
      setTimeout(() => {
        navigate(`/farmers/${id}`); // Correction du chemin
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>Modifier les informations</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nom :</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description :</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', minHeight: '100px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Adresse :</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Ville :</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Code postal :</label>
          <input
            type="text"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Téléphone :</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Site web :</label>
          <input
            type="url"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button
          type="submit"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}

export default UpdateFarmerForm;