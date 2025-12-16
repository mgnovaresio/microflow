// iot-simulator/simulator.js

const mqtt = require('mqtt');

// ** CONFIGURACIÓN **
// 1. URL de tu Broker Mosquitto (en Docker)
const BROKER_URL = 'mqtt://localhost:1883'; 

// 2. PEGA AQUÍ EL CONNECTION ID DE TU ACTUADOR DE COMANDO
// Este es el ID que usamos en el RF4 (ej. 69415f5edab764755c44278c0)
const DEVICE_ID = '69415f5edab76475c44278c0'; 

// 3. Tópico al que el dispositivo se va a suscribir
const COMMAND_TOPIC = `devices/${DEVICE_ID}/command`; 
// El tópico de respuesta/telemetría
const TELEMETRY_TOPIC = `devices/${DEVICE_ID}/telemetry`;

// Conectar al Broker
const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
    console.log(`[Dispositivo]  Conectado al Broker MQTT.`);
    
    // Suscribirse al tópico de comandos
    client.subscribe(COMMAND_TOPIC, (err) => {
        if (!err) {
            console.log(`[Dispositivo]  Escuchando comandos en: ${COMMAND_TOPIC}`);
            // Publicar un mensaje inicial de que está 'online'
            client.publish(TELEMETRY_TOPIC, JSON.stringify({
                data: 0,
                unit: 'STATUS',
                message: 'Device Initialized'
            }));
        }
    });
});

client.on('message', (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());
        console.log(`\n--- RECIBIDO ---`);
        console.log(`[Dispositivo]  Comando recibido en ${topic}: ${payload.command}`);
        
        // Lógica de comando
        if (payload.command === 'ACTIVATE_RELAY' && payload.value === true) {
            console.log(`[Dispositivo] 💡 Relay activado exitosamente.`);
            
            // Simular respuesta de telemetría (feedback al backend)
            setTimeout(() => {
                client.publish(TELEMETRY_TOPIC, JSON.stringify({
                    data: 1, // 1 significa ON
                    unit: 'RELAY_STATE',
                    message: 'Relay is now ON'
                }), () => {
                    console.log(`[Dispositivo] ⬆ Respuesta de estado enviada al Backend.`);
                });
            }, 1000); 

        } else if (payload.command === 'REBOOT') {
            console.log(`[Dispositivo]  Reiniciando...`);
        }

    } catch (e) {
        console.error('[Dispositivo] Error al procesar payload:', e);
    }
});

client.on('error', (err) => {
    console.error(`[Dispositivo] Error de conexión: ${err.message}`);
});