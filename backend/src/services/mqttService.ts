// src/services/mqttService.ts
import * as mqtt from 'mqtt';
import Device from '../models/Device';
import * as dotenv from 'dotenv';
import Telemetry from '../models/Telemetry'; // Importar el modelo histórico
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
        
        const parts = topic.split('/');
        const connectionId = parts[1]; // Este es el ID de conexión MQTT

        // 1. Encontrar el dispositivo por connectionId
        const device = await Device.findOne({ connectionId });

        if (!device) {
            console.warn(`[MQTT] Mensaje de dispositivo desconocido: ${connectionId}`);
            return;
        }

        // 2. RF3.2: Actualizar el estado del dispositivo (Última actividad)
        const updatedDevice = await Device.findOneAndUpdate( 
            { _id: device._id }, // Ya tenemos el objeto, actualizamos por _id
            { 
                status: 'online', 
                lastActivity: new Date(),
            },
            { new: true }
        );

        // 3. RF3.4: Guardar el dato histórico en la colección Telemetry
        await Telemetry.create({
            device: device._id, // Usamos el ID de MongoDB como referencia
            data: payload.data, 
            unit: payload.unit || 'unknown', // Suponemos que el payload trae 'unit'
            timestamp: new Date(),
        });
        
        console.log(`[MQTT] Datos recibidos de ${updatedDevice?.name} (${connectionId}). Tipo: ${payload.unit || 'Data'}. Histórico guardado.`);


    } catch (error) {
        console.error('Error al procesar mensaje MQTT:', error);
    }
}

// RF4.1: Función para publicar comandos
export function publishCommand(deviceId: string, command: string, value: any): void {
    if (!client || !client.connected) {
        console.error('Cliente MQTT no conectado. No se puede enviar el comando.');
        return;
    }

    // Tópico de Comando: devices/<ID>/command
    const topic = `devices/${deviceId}/command`;
    
    // Payload del comando
    const payload = JSON.stringify({
        command, // Ej: 'ACTIVATE_RELAY'
        value,   // Ej: true
        timestamp: new Date().toISOString()
    });

    client.publish(topic, payload, { qos: 1, retain: false }, (err) => {
        if (err) {
            console.error(`Error al publicar comando a ${topic}:`, err);
        } else {
            console.log(`[MQTT] ⬇ Comando publicado a ${topic}: ${command}`);
        }
    });
}
