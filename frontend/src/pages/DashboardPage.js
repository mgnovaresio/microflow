// microflow/frontend/src/pages/DashboardPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // 1. Verificar si el usuario está logueado y obtener su nombre
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      // Si no hay token, redirigir al login (Guardián de ruta)
      navigate('/login');
      return;
    }

    // Obtener el nombre del usuario (el JSON guardado en localStorage)
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setUserName(user.email.split('@')[0]); // Muestra solo 'testadmin'
    }

  }, [navigate]);

  // 2. Manejar el cierre de sesión
  const handleLogout = () => {
    authService.logout();
    navigate('/login'); // Volver al login después de cerrar sesión
  };

  return (
    <div className="alert alert-success text-center">
      <h2>¡Bienvenido al Dashboard, {userName}!</h2>
      <p>Has iniciado sesión correctamente.</p>
      
      <div className="mt-4">
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      
      <h3 className="mt-5">Aquí se listarán tus dispositivos...</h3>
    </div>
  );
};

export default DashboardPage;