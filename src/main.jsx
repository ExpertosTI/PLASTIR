import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CatalogApp from './CatalogApp.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Detect if current path or query is targeting the standalone Catalog App
const isCatalogRoute = () => {
  const pathname = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    pathname.includes('catalogo') ||
    search.includes('app=catalogo') ||
    search.includes('catalogo=1') ||
    hash.includes('#catalogo') ||
    pathname.endsWith('/catalogo.html')
  );
};

const RootComponent = isCatalogRoute() ? CatalogApp : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RootComponent />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)

