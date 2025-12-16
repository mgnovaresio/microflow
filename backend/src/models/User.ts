// src/models/User.ts
import { Schema, model, Document } from 'mongoose';

// 1. Interfaz de TypeScript (Contrato Lógico)
export interface IUser extends Document {
    email: string;
    password: string; 
    role: 'admin' | 'user'; 
    createdAt: Date;
    updatedAt: Date;
}

// 2. Esquema de Mongoose (Reglas de la Base de Datos)
const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [true, 'El email es obligatorio.'],
        unique: true, 
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria.'],
        select: false, // Oculta la contraseña por defecto en consultas
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
}, {
    timestamps: true,
});

// 3. Crear el Modelo
const User = model<IUser>('User', UserSchema);

export default User;