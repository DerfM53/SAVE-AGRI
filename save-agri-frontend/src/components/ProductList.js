import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';

function ProductList({ farmerId }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Récupérer la liste des produits du producteur depuis l'API back-end
    axios.get(`/products?farmerId=${farmerId}`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des produits', error);
      });
  }, [farmerId]);

  return (
    <div>
      <h2>Produits</h2>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductList;
