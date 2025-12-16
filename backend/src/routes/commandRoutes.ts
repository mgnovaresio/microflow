// src/routes/commandRoutes.ts
import { Router } from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware'; 
import { sendCommand } from '../controllers/CommandController';

const router = Router();

// Todas las rutas de comandos deben ser accedidas por un usuario logueado.
router.use(protect);
router.use(restrictTo('admin', 'user')); 

// RF4.2: Ruta POST para enviar el comando
// URL: /api/v1/commands/:id (donde :id es el _id de MongoDB del dispositivo)
router.route('/:id').post(sendCommand);

export default router;