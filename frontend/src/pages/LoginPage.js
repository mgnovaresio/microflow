// microflow/frontend/src/pages/LoginPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginPage = () => {
  // Estado para guardar email y password del formulario
  const [email, setEmail] = useState('testadmin@flow.com'); // Valor inicial para ahorrar tiempo
  const [password, setPassword] = useState('testpassword'); // Valor inicial para ahorrar tiempo
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirigir si ya está logueado
  useEffect(() => {
    if (authService.getToken()) {
      navigate('/'); // Redirigir a Dashboard si el token existe
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault(); // Evitar recarga de página
    setError('');

    try {
      await authService.login(email, password);
      navigate('/'); // Navegar al dashboard al tener éxito
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas. Verifica email y password.');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-lg">
          <div className="card-header bg-dark text-white text-center">
            <h3>Login Microflow IoT</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleLogin}>
              {/* Mensaje de Error */}
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Campo Email */}
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Campo Password */}
              <div className="mb-3">
                <label className="form-label">Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;