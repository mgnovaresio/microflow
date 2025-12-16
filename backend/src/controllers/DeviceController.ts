// src/controllers/DeviceController.ts
import { Request, Response } from 'express';
import Device, { IDevice } from '../models/Device';
import { Types } from 'mongoose'; // Necesario para manejar ObjectIds

// Interfaz extendida para usar req.user
interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

// RF2.2: Crear un nuevo dispositivo
export async function createDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        // Obtenemos el ID del dueño del token (gracias al middleware 'protect')
        const ownerId = req.user!.id; 
        const { name, type } = req.body;

        const newDevice = await Device.create({
            name,
            type,
            owner: new Types.ObjectId(ownerId), // Asigna el dueño al dispositivo
        });

        res.status(201).json({ 
            message: 'Dispositivo creado exitosamente.',
            device: newDevice 
        });

    } catch (error) {
        console.error("Error al crear dispositivo:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

// RF2.2: Obtener todos mis dispositivos (Solo los que me pertenecen)
export async function getMyDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const ownerId = req.user!.id;
        
        // RF2.2: Filtra por el ID del dueño
        const devices = await Device.find({ owner: ownerId }).populate('owner', 'email');

        res.status(200).json({ 
            count: devices.length,
            devices 
        });

    } catch (error) {
        console.error("Error al obtener dispositivos:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

// RF2.2: Obtener UN dispositivo por ID (y verificar que sea mío)
export async function getDeviceById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const ownerId = req.user!.id;
        const deviceId = req.params.id;

        const device = await Device.findOne({ 
            _id: deviceId,
            owner: ownerId // Seguridad: Asegura que solo se busque entre los míos
        });

        if (!device) {
            res.status(404).json({ message: 'Dispositivo no encontrado o no autorizado.' });
            return;
        }

        res.status(200).json({ device });

    } catch (error) {
        console.error("Error al obtener dispositivo por ID:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}


// RF2.2: Eliminar un dispositivo (Solo si soy el dueño)
export async function deleteDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const ownerId = req.user!.id;
        const deviceId = req.params.id;

        const result = await Device.findOneAndDelete({
            _id: deviceId,
            owner: ownerId // Seguridad: Solo el dueño puede eliminar
        });

        if (!result) {
            res.status(404).json({ message: 'Dispositivo no encontrado o no autorizado para eliminar.' });
            return;
        }

        res.status(200).json({ message: 'Dispositivo eliminado exitosamente.' });

    } catch (error) {
        console.error("Error al eliminar dispositivo:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

export async function updateDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const ownerId = req.user!.id;
        const deviceId = req.params.id;
        const { name, type } = req.body; // Solo permitimos actualizar nombre y tipo

        const updatedDevice = await Device.findOneAndUpdate(
            { _id: deviceId, owner: ownerId }, // Criterio de búsqueda (ID y Dueño)
            { name, type }, // Datos a actualizar
            { new: true, runValidators: true } // Opciones: devolver el doc nuevo y validar
        ).populate('owner', 'email');

        if (!updatedDevice) {
            res.status(404).json({ message: 'Dispositivo no encontrado o no autorizado para actualizar.' });
            return;
        }

        res.status(200).json({ 
            message: 'Dispositivo actualizado exitosamente.',
            device: updatedDevice 
        });

    } catch (error) {
        console.error("Error al actualizar dispositivo:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}