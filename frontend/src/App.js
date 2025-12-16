// microflow/frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importamos estilos de Bootstrap


// Componentes que crearemos
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DeviceDetailPage from './pages/DeviceDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="navbar navbar-dark bg-dark shadow-sm">
          <div className="container">
            <h1 className="navbar-brand">Microflow IoT Dashboard</h1>
          </div>
        </header>

        <main className="container mt-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/devices/:id" element={<DeviceDetailPage />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;