// src/routes/deviceRoutes.ts
import { Router } from 'express';
// Importamos el middleware de seguridad
import { protect, restrictTo } from '../middleware/authMiddleware'; 
// Importamos los controladores CRUD
import { 
    createDevice, 
    getMyDevices, 
    getDeviceById,
    deleteDevice,
    updateDevice,
} from '../controllers/DeviceController';

const router = Router();

// Todas las rutas de dispositivos DEBEN ser accedidas por un usuario logueado.
// Aplicamos el middleware 'protect' a todas las rutas bajo este router:
router.use(protect);

// RF2.2: CRUD Básico
router.route('/')
    .post(restrictTo('admin', 'user'), createDevice) // Crear: Solo usuarios/admins logueados
    .get(restrictTo('admin', 'user'), getMyDevices); // Leer todos (los míos): Solo usuarios/admins logueados

router.route('/:id')
    .get(restrictTo('admin', 'user'), getDeviceById) // Leer uno: Solo usuarios/admins logueados
    .patch(restrictTo('admin', 'user'), updateDevice)
    .delete(restrictTo('admin', 'user'), deleteDevice); // Eliminar: Solo usuarios/admins logueados

// Más adelante: router.patch('/:id', updateDevice);

export default router;