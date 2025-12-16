// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs'; // La Caja Fuerte
import jwt from 'jsonwebtoken'; // Los Pases VIP

import User, { IUser } from '../models/User'; 

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback_secret_must_be_changed';
const SALT_ROUNDS = 10; 

// RF1.1: Función para registrar un nuevo usuario
export async function register(req: Request, res: Response): Promise<void> {
    const { email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'El usuario ya existe.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await User.create({ 
            email,
            password: hashedPassword,
            role: role || 'user', 
        });

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: 'Usuario creado exitosamente.',
            token,
            user: { id: newUser._id, email: newUser.email, role: newUser.role }
        });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

// RF1.2: Función para iniciar sesión
export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
        // Buscamos al usuario, pidiendo explícitamente el campo 'password'
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            res.status(401).json({ message: 'Credenciales inválidas.' });
            return;
        }

        // Comparamos la contraseña con la versión hasheada
        const isMatch = await bcrypt.compare(password, user.password!);

        if (!isMatch) {
            res.status(401).json({ message: 'Credenciales inválidas.' });
            return;
        }

        // Generamos el Pase VIP (JWT)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        ); 

        res.json({ token, user: { id: user._id, email: user.email, role: user.role } });

    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
}