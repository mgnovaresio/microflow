// microflow/frontend/src/pages/DeviceDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import deviceService from '../services/deviceService';
import authService from '../services/authService';

const DeviceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); // Estado para el formulario de actualización
    const [updateForm, setUpdateForm] = useState({ name: '', type: '' });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Tipos de dispositivos permitidos (para la validación del formulario)
    const deviceTypes = ['sensor', 'actuator'];

    // --- Lógica de Carga Inicial ---
    const fetchDevice = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await deviceService.getDeviceById(id);
            const loadedDevice = data.device;
            setDevice(loadedDevice);
            // Inicializar el formulario con los datos actuales
            setUpdateForm({ name: loadedDevice.name, type: loadedDevice.type });
        } catch (err) {
            console.error('Error al cargar detalle del dispositivo:', err.response || err);
            setError('No se pudo cargar la información del dispositivo. Podría no existir o no ser tuyo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authService.getToken()) {
            navigate('/login');
            return;
        }
        fetchDevice();
    }, [id, navigate]);


    // --- Lógica de Actualización (RF2.4 PATCH) ---
    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({ ...prev, [name]: value }));
        setSuccessMessage(null); // Limpiar mensaje de éxito al empezar a editar
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const data = await deviceService.updateDevice(id, updateForm);
            
            // Actualizar el estado local del dispositivo con los nuevos datos
            setDevice(data.device); 
            setSuccessMessage(`Dispositivo "${data.device.name}" actualizado con éxito.`);

        } catch (err) {
            console.error('Error al actualizar dispositivo:', err.response || err);
            setError('Fallo al actualizar. Verifica el nombre y tipo.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border" role="status"></div><p>Cargando detalles...</p></div>;
    }

    if (error && !device) {
        return <div className="alert alert-danger">{error}</div>;
    }
    
    if (!device) {
        return <div className="alert alert-warning">No se encontró información del dispositivo.</div>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Detalles de: {device.name}</h2>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>
                    ← Volver al Dashboard
                </button>
            </div>

            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="row">
                {/* Columna 1: Información Básica del Dispositivo */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Información Técnica (Lectura)</h5>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item"><strong>Tipo:</strong> {device.type.toUpperCase()}</li>
                                <li className="list-group-item">
                                    <strong>Estado:</strong> 
                                    <span className={`badge bg-${device.status === 'online' ? 'success' : 'secondary'} ms-2`}>
                                        {device.status.toUpperCase()}
                                    </span>
                                </li>
                                <li className="list-group-item"><strong>ID Interno (MongoDB):</strong> {device._id}</li>
                                <li className="list-group-item"><strong>ID de Conexión (MQTT):</strong> {device.connectionId}</li>
                                <li className="list-group-item"><strong>Última Actividad:</strong> {new Date(device.lastActivity).toLocaleString()}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Columna 2: Formulario de Actualización (RF2.4) */}
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm border-warning">
                        <div className="card-body">
                            <h5 className="card-title text-warning">🛠️ Actualizar Dispositivo</h5>
                            <form onSubmit={handleUpdateSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Nombre del Dispositivo</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="name"
                                        value={updateForm.name} 
                                        onChange={handleUpdateChange} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Tipo</label>
                                    <select 
                                        className="form-select" 
                                        name="type"
                                        value={updateForm.type} 
                                        onChange={handleUpdateChange} 
                                        required
                                    >
                                        {deviceTypes.map(t => (
                                            <option key={t} value={t}>{t.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-warning w-100" 
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Espacio para Gráficos de Telemetría (RF3.3/3.4) */}
            <h3 className="mt-5">📈 Datos Históricos y Telemetría</h3>
            <div className="alert alert-info">
                Aquí implementaremos la lógica para consultar y mostrar los datos históricos de la colección 'Telemetry' que ya creamos en el backend.
            </div>
            
        </div>
    );
};

export default DeviceDetailPage;