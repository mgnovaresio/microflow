// src/services/mqttService.ts
import * as mqtt from 'mqtt';
import Device from '../models/Device';
import * as dotenv from 'dotenv';
dotenv.config();

// Obtener la URL del broker desde las variables de entorno o Docker
const MQTT_BROKER_URL: string = process.env.MQTT_BROKER_URL || 'mqtt://127.0.0.1:1883';
const TELEMETRY_TOPIC: string = 'devices/+/telemetry'; 

let client: mqtt.MqttClient | null = null;

export function connectMqttBroker() {
    console.log(`🔌 Conectando a Broker MQTT en ${MQTT_BROKER_URL}...`);
    
    // Conecta al broker (que está corriendo en Docker)
    client = mqtt.connect(MQTT_BROKER_URL);

    client.on('connect', () => {
        console.log('Broker MQTT conectado.');

        // RF3.1: Suscribirse a Tópicos
        // '#' significa todos los tópicos. 
        // 'devices/+/telemetry' significa todos los mensajes de telemetría de cualquier dispositivo.
        client!.subscribe(TELEMETRY_TOPIC, (err) => {
            if (err) {
                console.error(`Error al suscribirse a ${TELEMETRY_TOPIC}:`, err);
            } else {
                console.log(`Suscrito a tópico de telemetría: ${TELEMETRY_TOPIC}`);
            }
        });
    });

    client.on('message', handleIncomingMessage);

    client.on('error', (err) => {
        console.error('Error en la conexión MQTT:', err);
    });
}

// RF3.2: Función para manejar los mensajes entrantes (la lógica de la telemetría)
async function handleIncomingMessage(topic: string, message: Buffer) {
    try {
        const payload = JSON.parse(message.toString());
        
        // 1. Extraer el ID del dispositivo del tópico
        // El tópico es 'devices/<DEVICE_ID>/telemetry'
        const parts = topic.split('/');
        const deviceId = parts[1]; 
        
        // 2. RF3.2: Actualizar el estado del dispositivo en la BD
        const updatedDevice = await Device.findOneAndUpdate( // <-- USAMOS FIND ONE AND UPDATE
            { connectionId: deviceId }, // <-- ¡BUSCAMOS POR EL CAMPO connectionId!
            { 
                status: 'online', 
                lastActivity: new Date(),
                // Aquí podrías guardar los datos (payload) en otra colección si fuera necesario
            },
            { new: true }
        );

        if (updatedDevice) {
            console.log(`[MQTT] Datos recibidos de ${updatedDevice.name} (${deviceId}). Tipo: ${payload.data}`);
        } else {
            console.warn(`[MQTT]  Mensaje de dispositivo desconocido: ${deviceId}`);
        }

    } catch (error) {
        console.error('Error al procesar mensaje MQTT:', error);
    }
}