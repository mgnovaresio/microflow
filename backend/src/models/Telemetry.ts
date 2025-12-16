// microflow/backend/src/models/Telemetry.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

// Interfaz que define la estructura del documento en MongoDB
export interface ITelemetry extends Document {
    device: Types.ObjectId; // Referencia al dispositivo (RF2)
    timestamp: Date;       // Marca de tiempo del dato (RF3.2)
    data: any;             // El valor reportado (ej: 25.5, 'ON', etc.)
    unit: string;          // Tipo de dato (ej: 'temperature', 'humidity', 'relay_state')
}

const TelemetrySchema: Schema = new Schema({
    device: {
        type: Schema.Types.ObjectId,
        ref: 'Device', // Hace referencia al modelo Device
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    data: {
        type: Schema.Types.Mixed, // Permite guardar números, booleanos o strings
        required: true,
    },
    unit: {
        type: String,
        required: true,
        trim: true,
    },
});

// Índice para consultas rápidas por dispositivo y tiempo (RF3.4)
TelemetrySchema.index({ device: 1, timestamp: -1 });

export default mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);