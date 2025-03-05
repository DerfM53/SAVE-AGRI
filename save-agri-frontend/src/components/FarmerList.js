import React from 'react';
import FarmerCard from './FarmerCard';

function FarmerList({ farmers }) {
  const containerStyle = {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };
  
  const titleStyle = {
    color: '#4CAF50',
    borderBottom: '2px solid #4CAF50',
    paddingBottom: '10px',
    marginTop: '0'
  };
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Producteurs locaux ({farmers.length})</h2>
      
      {farmers.length === 0 ? (
        <p>Aucun producteur trouvé dans cette zone.</p>
      ) : (
        <div style={gridStyle}>
          {farmers.map(farmer => (
            <FarmerCard key={farmer.id} farmer={farmer} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FarmerList;
