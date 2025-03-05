import React from 'react';

function ProductCard({ product }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <img src={product.image_url} alt={product.name} />
    </div>
  );
}

export default ProductCard;
