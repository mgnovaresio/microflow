// src/controllers/CommandController.ts
import { Request, Response } from 'express';
import Device from '../models/Device';
import { publishCommand } from '../services/mqttService'; // <-- Importamos la función de MQTT

// Interfaz extendida para usar req.user (Necesaria para seguridad)
interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

// RF4.2: Enviar un comando a un dispositivo específico
export async function sendCommand(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const ownerId = req.user!.id; // El ID del usuario logueado
        const deviceId = req.params.id; // ID de MongoDB que viene en la URL
        const { command, value } = req.body; // Ej: { command: 'REBOOT', value: true }

        if (!command) {
            res.status(400).json({ message: 'El campo "command" es obligatorio.' });
            return;
        }
        
        // 1. Verificar si el dispositivo existe y si el usuario es el dueño (Seguridad RF2.2)
        const device = await Device.findOne({
            _id: deviceId, // Buscamos por el ID de MongoDB (URL)
            owner: ownerId // Verificamos la propiedad
        });

        if (!device) {
            res.status(404).json({ message: 'Dispositivo no encontrado o no autorizado para enviar comandos.' });
            return;
        }

        // 2. RF4.1: Publicar el comando al tópico de conexión del dispositivo
        // Usamos el connectionId del dispositivo, que es el tópico real de MQTT.
        publishCommand(device.connectionId, command, value); 

        res.status(200).json({
            message: `Comando '${command}' enviado exitosamente al dispositivo ${device.name}.`,
            topic: `devices/${device.connectionId}/command`
        });

    } catch (error) {
        console.error("Error al enviar comando:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

