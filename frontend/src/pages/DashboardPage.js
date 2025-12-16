// microflow/frontend/src/pages/DashboardPage.js 

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- AÑADIR Link
import authService from '../services/authService';
import deviceService from '../services/deviceService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para cargar dispositivos (RF2/RF3)
  const fetchDevices = async () => {
    try {
      const data = await deviceService.getDevices();
      setDevices(data);
    } catch (err) {
      console.error('Error al cargar dispositivos:', err);
      setError('No se pudieron cargar los dispositivos. ¿Backend activo?');
      if (err.response && err.response.status === 401) {
        authService.logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Lógica de carga y guardián de ruta
  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
      setUserName(user.email.split('@')[0]);
    }

    fetchDevices();
  }, [navigate]);

  // Manejar el cierre de sesión
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Manejar el envío de comando (RF4)
  const handleSendCommand = async (deviceId, deviceName) => {
    try {
      const command = 'ACTIVATE_RELAY';
      const value = true; 
      
      await deviceService.sendCommand(deviceId, command, value);
      alert(`Comando '${command}' enviado a ${deviceName}. Verifica la Terminal 1 y 3.`);
    
    } catch (err) {
      console.error('Error al enviar comando:', err);
      alert('Fallo al enviar el comando. ¿Token vencido?');
    }
  };

  // Manejar la eliminación de dispositivo (RF2.4 DELETE)
  const handleDelete = async (deviceId, deviceName) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el dispositivo ${deviceName}? Esta acción es irreversible.`)) {
        return;
    }
    
    try {
        await deviceService.deleteDevice(deviceId);
        alert(`Dispositivo ${deviceName} eliminado con éxito.`);
        
        // Actualizar la lista de dispositivos en el estado (sin recargar la página)
        setDevices(devices.filter(d => d._id !== deviceId)); 

    } catch (err) {
        console.error('Error al eliminar dispositivo:', err);
        alert('Fallo al eliminar el dispositivo. Inténtalo de nuevo.');
    }
  };


  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard IoT de {userName}</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
      
      <h4 className="mb-3">📡 Mis Dispositivos ({devices.length})</h4>

      <table className="table table-striped table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Nombre / Detalle (RF6.2)</th> {/* <-- Título actualizado */}
            <th>Tipo</th>
            <th>ID de Conexión</th>
            <th>Estado (RF3)</th>
            <th>Última Actividad</th>
            <th>Comando (RF4)</th>
            <th>Eliminar (RF2.4)</th> {/* <-- Nueva columna */}
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device._id}>
              {/* RF6.2: CONVERTIR EL NOMBRE EN ENLACE A LA VISTA DE DETALLE */}
              <td>
                <Link to={`/devices/${device._id}`}>
                    <strong>{device.name}</strong>
                </Link>
              </td>
              <td>
                <span className={`badge bg-${device.type === 'sensor' ? 'info' : 'warning'} text-dark`}>
                  {device.type.toUpperCase()}
                </span>
              </td>
              <td>{device.connectionId.substring(0, 10)}...</td>
              <td>
                <span className={`badge bg-${device.status === 'online' ? 'success' : 'secondary'}`}>
                  {device.status.toUpperCase()}
                </span>
              </td>
              <td>{new Date(device.lastActivity).toLocaleTimeString()}</td>
              <td>
                {device.type === 'actuator' && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendCommand(device._id, device.name)}
                  >
                    Activar Relevador
                  </button>
                )}
              </td>
              {/* RF2.4: BOTÓN DE ELIMINAR */}
              <td>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(device._id, device.name)}
                >
                    Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DashboardPage;