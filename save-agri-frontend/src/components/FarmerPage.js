//save-agri-frontend/src/components/FarmerPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerService } from '../services/api';
import authService from '../services/authService';
import './FarmerPage.css';

function FarmerPage() {
  console.log('FarmerPage - Début du rendu');
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Nouveau state pour currentUser

  useEffect(() => {
    // Récupérer l'utilisateur au montage du composant
    const user = authService.getCurrentUser();
    console.log('CurrentUser après récupération:', user);
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const fetchFarmer = async () => {
      if (!id) return; // Protection contre un ID manquant
      setLoading(true);
      try {
        const farmerData = await farmerService.getFarmer(id);
        console.log('FarmerData récupérée:', farmerData); // Nouveau log
        setFarmer(farmerData);
        setError(''); // Réinitialiser l'erreur en cas de succès
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
        setFarmer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [id]); // Dépendance uniquement sur l'id

  // Vérification de l'affichage des boutons
  const shouldShowButtons = useMemo(() => {
    console.log('Vérification des droits:', {
      'currentUser': currentUser,
      'farmer': farmer,
      'currentUser?.id': currentUser?.id,
      'farmer?.user_id': farmer?.user_id
  });
    return Boolean(
      currentUser?.id && 
      farmer?.user_id && 
      String(currentUser.id) === String(farmer.user_id)
    );
  }, [currentUser, farmer]);

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) {
      try {
        await farmerService.deleteFarmer(id);
        navigate('/');
      } catch (error) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="farmer-page" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff'
    }}>
      {/* En-tête avec image de couverture */}
      <div className="farmer-header" style={{
        position: 'relative',
        height: '300px',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        {farmer.photo ? (
          <img 
            src={farmer.photo} 
            alt={farmer.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#4CAF50',
            opacity: 0.8
          }} />
        )}
        <h1 style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: 'white',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {farmer.name}
        </h1>
      </div>

      {/* Informations principales */}
      <div className="farmer-content" style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        <div className="farmer-description">
          <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>À propos</h2>
          <p style={{ lineHeight: '1.6', fontSize: '1.1em' }}>{farmer.description}</p>
        </div>

        <div className="farmer-contact" style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>Contact</h3>
          <p><strong>Adresse:</strong><br />{farmer.address}<br />{farmer.city}, {farmer.zip_code}</p>
          {farmer.phone && <p><strong>Téléphone:</strong><br />{farmer.phone}</p>}
          {farmer.website && (
            <p>
              <strong>Site web:</strong><br />
              <a 
                href={farmer.website.startsWith('http') ? farmer.website : `https://${farmer.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4CAF50' }}
              >
                {farmer.website}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Boutons d'action (uniquement pour le propriétaire) */}
      {shouldShowButtons ? (
        <div className="action-buttons" style={{
          borderTop: '1px solid #eee',
          paddingTop: '20px',
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <button 
            onClick={() => navigate(`/farmer/${id}/edit`)}
            style={{
              padding: '12px 30px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s'
            }}
          >
            Modifier
          </button>
          <button 
            onClick={handleDelete}
            style={{
              padding: '12px 30px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s'
            }}
          >
            Supprimer
          </button>
        </div>
      ) : (
        <p>Vous n'avez pas les droits pour modifier ou supprimer ce profil.</p>
      )}
    </div>
  );
}

export default FarmerPage;
