// src/routes/authRoutes.ts

import { Router } from 'express';
import { protect, restrictTo, AuthenticatedRequest } from '../middleware/authMiddleware'; 
import { register, login } from '../controllers/AuthController';

const router = Router();

// Endpoint para registrar un nuevo usuario
router.post('/register', register);

// Endpoint para iniciar sesión
router.post('/login', login);

// Ruta de prueba protegida: Solo accesible si estás logueado y eres 'admin'
router.get('/secret-admin', protect, restrictTo('admin'), (req: AuthenticatedRequest, res) => {
    // TypeScript ahora sabe que req tiene la propiedad 'user'
    res.json({ message: `Bienvenido Admin, tu ID es ${req.user!.id}` });
});

export default router;