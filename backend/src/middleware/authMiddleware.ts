// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extender la interfaz Request de Express para que TypeScript sepa que añadiremos 'user'
export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: string };
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback_secret_must_be_changed';

// Función principal del Middleware
export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 1. Obtener el token del encabezado (Header)
    let token;

    // Los tokens suelen venir en el formato: Authorization: Bearer <TOKEN>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extraemos solo la cadena del token
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No autorizado, no hay token.' });
    }

    try {
        // 2. Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        // 3. Adjuntar la información del usuario al objeto request (para usarlo en el controlador)
        req.user = { 
            id: decoded.id, 
            role: decoded.role 
        };
        
        // 4. Continuar con la siguiente función (el controlador de la ruta)
        next(); 

    } catch (error) {
        console.error('Error de verificación de token:', error);
        res.status(401).json({ message: 'No autorizado, token inválido.' });
    }
};

// Middleware para restringir acceso por rol (RF1.3)
export const restrictTo = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        // Comprobamos si el rol del usuario (adjunto en el middleware 'protect') está permitido
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Acceso denegado. Rol insuficiente.' });
        }
        next();
    };
};



