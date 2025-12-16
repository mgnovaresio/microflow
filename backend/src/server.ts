// src/server.ts
import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose'; 
import authRoutes from './routes/authRoutes';
import deviceRoutes from './routes/deviceRoutes';
import { connectMqttBroker } from './services/mqttService';

dotenv.config(); // Carga las variables del archivo .env

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
// Nuevo: Obtenemos la URL de MongoDB desde .env
const MONGO_URI: string = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/microflowdb'; 

// Middleware para procesar JSON
app.use(express.json()); 

// 1. Conexión de Rutas
app.use('/api/v1/auth', authRoutes);


// 2. Ruta Raíz
app.get('/', (req: Request, res: Response) => {
    res.send('Microflow Backend v1.0 Activo y Conectado a BD!');
});

// 3. Lógica de Conexión a Base de Datos
async function connectDB() {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGODB_URI no está definido.");
        }
        // Intentamos conectar, pero no esperamos a que termine aquí.
        // Los eventos de Mongoose manejarán el inicio del servidor.
        await mongoose.connect(MONGO_URI); 

    } catch (error) {
        console.error('❌ Error al iniciar la conexión a MongoDB:', error);
        process.exit(1); 
    }
}

// 4. Rutas de Dispositivos (Rf2) 
app.use('/api/v1/devices', deviceRoutes);

// 5. Manejo de Eventos (Inicia el Servidor SÓLO si la BD está lista)
mongoose.connection.on('connected', () => {
    console.log('✅ Base de Datos (MongoDB) conectada.');
    
    // El servidor se enciende sólo cuando la BD confirma la conexión estable.
    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });

    //RF3.1: Iniciar la conexión al Broker MQTT
    connectMqttBroker();
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de tiempo de ejecución de MongoDB:', err);
});


// 6. Ejecutar el proceso de conexión al iniciar
connectDB();