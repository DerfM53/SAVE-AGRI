import React from 'react';
import { Link } from 'react-router-dom';

function FarmerCard({ farmer }) {
  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    margin: '15px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    backgroundColor: 'white'
  };
  
  const hoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  };
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  const titleStyle = {
    color: '#4CAF50',
    margin: '0 0 10px 0'
  };
  
  const addressStyle = {
    color: '#666',
    fontSize: '0.9rem',
    margin: '5px 0'
  };
  
  const descriptionStyle = {
    margin: '10px 0'
  };
  
  const linkStyle = {
    display: 'inline-block',
    padding: '8px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    marginTop: '10px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  };

  return (
    <div 
      style={{ ...cardStyle, ...(isHovered ? hoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={titleStyle}>{farmer.name}</h3>
      
      {farmer.address && (
        <p style={addressStyle}>
          {farmer.address}, {farmer.city} {farmer.zip_code}
        </p>
      )}
      
      {farmer.phone && (
        <p style={addressStyle}>
          <strong>Téléphone:</strong> {farmer.phone}
        </p>
      )}
      
      {farmer.description && (
        <p style={descriptionStyle}>
          {farmer.description.length > 150
            ? `${farmer.description.substring(0, 150)}...`
            : farmer.description}
        </p>
      )}
      
      <Link to={`/farmers/${farmer.id}`} style={linkStyle}>
        Voir les détails
      </Link>
      
      {farmer.website && (
        <a 
          href={farmer.website.startsWith('http') ? farmer.website : `https://${farmer.website}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            ...linkStyle,
            backgroundColor: '#2196F3',
            marginLeft: '10px'
          }}
        >
          Visiter le site web
        </a>
      )}
    </div>
  );
}

export default FarmerCard;
