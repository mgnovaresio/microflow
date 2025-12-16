// microflow/frontend/src/services/authService.js

import axios from 'axios';

// URL base de tu backend (donde corre tu servidor Node.js)
const API_URL = 'http://localhost:3000/api/v1/auth';

/**
 * Lógica para iniciar sesión y guardar el token JWT.
 * @param {string} email
 * @param {string} password
 * @returns {object} Datos del usuario y token.
 */
const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });

  // Si el login es exitoso, guardamos el token en el almacenamiento local del navegador
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};

/**
 * Lógica para cerrar sesión y eliminar el token.
 */
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Obtenemos el token para enviarlo en las cabeceras de las peticiones protegidas
const getToken = () => {
  return localStorage.getItem('token');
};

const authService = {
  login,
  logout,
  getToken,
};

export default authService;