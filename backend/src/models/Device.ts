// src/models/Device.ts
import { Schema, model, Document, Types } from 'mongoose';

// 1. Interfaz de TypeScript para el Dispositivo
export interface IDevice extends Document {
    name: string;
    type: 'sensor' | 'actuator' | 'gateway'; // RF2.3: Tipos de dispositivos
    owner: Types.ObjectId; // Referencia al usuario (dueño)
    connectionId: string; // ID único para el broker MQTT
    status: 'online' | 'offline';
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Esquema de Mongoose
const DeviceSchema = new Schema<IDevice>({
    name: {
        type: String,
        required: [true, 'El nombre del dispositivo es obligatorio.'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['sensor', 'actuator', 'gateway'],
        required: [true, 'El tipo de dispositivo es obligatorio.'],
    },
    // RF2.1: El campo owner hace referencia al modelo 'User'
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    connectionId: {
        type: String,
        required: [true, 'El ID de conexión es obligatorio.'],
        unique: true,
        default: () => new Types.ObjectId().toHexString(), // Genera un ID por defecto
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline',
    },
    lastActivity: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// 3. Crear el Modelo
const Device = model<IDevice>('Device', DeviceSchema);

export default Device;