// microflow/frontend/src/services/deviceService.js

import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:3000/api/v1';

// Función auxiliar para obtener las cabeceras de autorización
const authHeader = () => {
    return {
        headers: {
            Authorization: `Bearer ${authService.getToken()}`,
        },
    };
};

/**
 * RF2: Obtiene la lista de dispositivos del usuario logueado.
 */
const getDevices = async () => {
    const response = await axios.get(`${API_URL}/devices`, authHeader());
    return response.data.devices; // Devolvemos el array de dispositivos
};

/**
 * RF4: Envía un comando a un dispositivo específico.
 * @param {string} deviceId - El _id de MongoDB del dispositivo.
 * @param {string} command - El nombre del comando (ej: ACTIVATE_RELAY).
 * @param {any} value - El valor del comando (ej: true).
 */
const updateDevice = async (deviceId, deviceData) => {
    const response = await axios.patch(`${API_URL}/devices/${deviceId}`, deviceData, authHeader());
    return response.data;
};

const getDeviceById = async (deviceId) => {
    const response = await axios.get(`${API_URL}/devices/${deviceId}`, authHeader());
    return response.data;
};

const deleteDevice = async (deviceId) => { 
    const response = await axios.delete(`${API_URL}/devices/${deviceId}`, authHeader());
    return response.data;
};

const sendCommand = async (deviceId, command, value) => {
    const response = await axios.post(
        `${API_URL}/commands/${deviceId}`,
        { command, value },
        authHeader() // Necesita el token
    );
    return response.data;
};

const deviceService = {
    getDevices,
    sendCommand,
    deleteDevice, 
    getDeviceById,
    updateDevice,
};

export default deviceService;