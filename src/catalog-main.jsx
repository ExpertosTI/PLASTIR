import React from 'react';
import ReactDOM from 'react-dom/client';
import { CatalogApp } from './CatalogApp.jsx';
import './index.css';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <CatalogApp />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
