// src/server.ts 

import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose'; 
import authRoutes from './routes/authRoutes';
import deviceRoutes from './routes/deviceRoutes';
import commandRoutes from './routes/commandRoutes';
import { connectMqttBroker } from './services/mqttService';
import cors from 'cors';
// NOTA: Eliminamos 'body-parser', ya que 'express.json()' lo reemplaza eficientemente.
// import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const MONGO_URI: string = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/microflowdb'; 

// =========================================================
// 1. CONFIGURACIÓN GLOBAL (MIDDLEWARES) - DEBE IR PRIMERO
// =========================================================

// 1.1 CORS: Permite que el Frontend (3001) acceda al Backend (3000)
app.use(cors({
    origin: 'http://localhost:3001', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// 1.2 JSON Parser: Permite a Express leer el cuerpo JSON (email, password)
// ESTO ES CRUCIAL PARA EL LOGIN Y DEBE ESTAR ANTES DE LAS RUTAS
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
// =========================================================


// 2. Rutas de la API (Routing)

app.get('/', (req: Request, res: Response) => {
    res.send('Microflow Backend v1.0 Activo y Conectado a BD!');
});

// Rutas de Autenticación (RF1)
app.use('/api/v1/auth', authRoutes);

// Rutas de Dispositivos (RF2) 
app.use('/api/v1/devices', deviceRoutes);

// Rutas de Comandos (RF4)
app.use('/api/v1/commands', commandRoutes);


// 3. Lógica de Conexión a Base de Datos
async function connectDB() {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGODB_URI no está definido.");
        }
        await mongoose.connect(MONGO_URI); 

    } catch (error) {
        console.error('❌ Error al iniciar la conexión a MongoDB:', error);
        process.exit(1); 
    }
}

// 4. Manejo de Eventos (Inicia el Servidor SÓLO si la BD está lista)
mongoose.connection.on('connected', () => {
    console.log('✅ Base de Datos (MongoDB) conectada.');
    
    app.listen(PORT, () => {
        console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });

    // RF3.1: Iniciar la conexión al Broker MQTT
    connectMqttBroker();
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de tiempo de ejecución de MongoDB:', err);
});


// 5. Ejecutar el proceso de conexión al iniciar
connectDB();