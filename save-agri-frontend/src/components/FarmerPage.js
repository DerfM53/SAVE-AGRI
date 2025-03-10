import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerService } from '../services/api';
import authService from '../services/authService';
import './FarmerPage.css';

function FarmerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchFarmer = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log('Tentative de récupération du farmer avec l\'ID:', id);
        const farmerData = await farmerService.getFarmer(id);
        console.log('Données complètes du farmer:', farmerData);
        
        if (farmerData.image_url) {
          console.log('Test de l\'URL de l\'image:', farmerData.image_url);
          // Tester si l'image est accessible
          const img = new Image();
          img.onload = () => console.log('✅ Image accessible');
          img.onerror = () => console.error('❌ Image inaccessible');
          img.src = farmerData.image_url;
        }
        
        setFarmer(farmerData);
        setError('');
      } catch (error) {
        console.error('Erreur détaillée:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!farmer) return <div>Aucune donnée trouvée</div>;

  return (
    <div className="farmer-page-container">
      <div className="farmer-header">
        {farmer.image_url ? (
          <div className="farmer-image-container">
            <img
              src={farmer.image_url}
              alt={`Ferme ${farmer.name}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onLoad={(e) => console.log('Image chargée:', e.target.src)}
              onError={(e) => {
                console.error('Erreur de chargement:', e.target.src);
                e.target.parentElement.classList.add('farmer-image-placeholder');
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="farmer-image-placeholder" />
        )}
        <h1>{farmer.name}</h1>
      </div>

      <div className="farmer-info">
        <p><strong>Description:</strong> {farmer.description}</p>
        <p><strong>Adresse:</strong> {farmer.address}, {farmer.city} {farmer.zip_code}</p>
        <p><strong>Téléphone:</strong> {farmer.phone}</p>
        {farmer.website && (
          <p><strong>Site web:</strong> <a href={farmer.website} target="_blank" rel="noopener noreferrer">
            {farmer.website}
          </a></p>
        )}
      </div>

      {currentUser && farmer.user_id === currentUser.id && (
        <div className="farmer-actions">
          <button onClick={() => navigate(`/farmer/${id}/edit`)}>Modifier</button>
          <button onClick={() => {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ferme ?')) {
              farmerService.deleteFarmer(id).then(() => navigate('/'));
            }
          }}>Supprimer</button>
        </div>
      )}
    </div>
  );
}

export default FarmerPage;
