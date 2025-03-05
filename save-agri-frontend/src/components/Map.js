import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour les icônes Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour centrer la carte sur les markers
function SetViewOnFarmers({ farmers }) {
  const map = useMap();
  
  useEffect(() => {
    if (farmers && farmers.length > 0) {
      // Créer un groupe de points pour ajuster la vue
      const points = farmers.map(farmer => {
        // Vérifier le format des coordonnées
        let lat, lng;
        try {
          if (farmer.location) {
            // Si location est une chaîne JSON, la parser
            const locationData = typeof farmer.location === 'string' 
              ? JSON.parse(farmer.location) 
              : farmer.location;
            
            // Extraire les coordonnées selon le format
            if (locationData.coordinates && Array.isArray(locationData.coordinates)) {
              // Format GeoJSON: [longitude, latitude]
              [lng, lat] = locationData.coordinates;
            } else if (locationData.lat !== undefined && locationData.lng !== undefined) {
              // Format {lat, lng}
              lat = locationData.lat;
              lng = locationData.lng;
            }
          }
        } catch (e) {
          console.error("Erreur lors du parsing des coordonnées:", e);
        }
        
        // Retourner un point Leaflet si les coordonnées sont valides
        return (lat && lng) ? L.latLng(lat, lng) : null;
      }).filter(point => point !== null);
      
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [farmers, map]);
  
  return null;
}

function Map({ farmers }) {
  const [defaultCenter, setDefaultCenter] = useState([46.227638, 2.213749]); // Centre de la France par défaut
  const [validFarmers, setValidFarmers] = useState([]);
  
  useEffect(() => {
    // Filtrer et formater les farmers avec des coordonnées valides
    if (farmers && farmers.length > 0) {
      const processed = farmers.map(farmer => {
        try {
          let lat, lng;
          
          // Traiter le champ location selon son format
          if (farmer.location) {
            // Si c'est une chaîne, essayer de la parser
            const locationData = typeof farmer.location === 'string' 
              ? JSON.parse(farmer.location) 
              : farmer.location;
              
            // Extraire les coordonnées selon le format
            if (locationData.coordinates && Array.isArray(locationData.coordinates)) {
              // Format GeoJSON: [longitude, latitude]
              [lng, lat] = locationData.coordinates;
            } else if (locationData.lat !== undefined && locationData.lng !== undefined) {
              // Format {lat, lng}
              lat = locationData.lat;
              lng = locationData.lng;
            }
          }
          
          if (lat && lng) {
            return {
              ...farmer,
              validCoordinates: { lat, lng }
            };
          }
        } catch (e) {
          console.error("Erreur lors du traitement des coordonnées pour le fermier:", farmer.id, e);
        }
        return null;
      }).filter(f => f !== null);
      
      setValidFarmers(processed);
      
      // Si au moins un agriculteur a des coordonnées valides, centrer sur le premier
      if (processed.length > 0) {
        setDefaultCenter([processed[0].validCoordinates.lat, processed[0].validCoordinates.lng]);
      }
    }
  }, [farmers]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Carte des agriculteurs</h2>
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validFarmers.map(farmer => (
          <Marker
            key={farmer.id}
            position={[farmer.validCoordinates.lat, farmer.validCoordinates.lng]}
          >
            <Popup>
              <div>
                <h3>{farmer.name}</h3>
                <p>{farmer.address}, {farmer.city}</p>
                <a 
                  href={`/farmers/${farmer.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    background: '#4CAF50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}
                >
                  Voir les détails
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
        <SetViewOnFarmers farmers={validFarmers} />
      </MapContainer>
    </div>
  );
}

export default Map;
