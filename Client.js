// ZMQ y sensor
var zmq = require("zmq");
var sensorLib = require('node-dht-sensor');

// IP y puerto
var server_ip = "85.219.25.246";
var server_pull_port = 3001;
var server_pub_port = 3002;

// Argumentos: node Client.js ID
if (process.argv.length != 3) {
    console.log("node Client.js ID");
    process.exit();
}

// Nuestra ID
var rasp_id = process.argv[2];

// Tiempo de lectura en ms (10*60*1000 = 10 min)
var readTime = 10*60*1000;

// Socket push, solo enviamos
var push_sock = zmq.socket("push");
// Conexion
push_sock.connect("tcp://" + server_ip + ":" + server_pull_port);

// Un socket sub para que el server pueda pedir la info cuando quiera
var sub = zmq.socket('sub');
// Conexion
sub.connect("tcp://" + server_ip + ":" + server_pub_port);
// TAGS: nuestra id y "ALL"
sub.subscribe(rasp_id);
sub.subscribe("ALL");

// Sensor
var sensor = {
    // Tipo de sensor 11, pin 4
    initialize: function () {
        return sensorLib.initialize(11, 4);
    },
    // Funcion de lectura continua
    read: function () {
        // Leemos
        var readout = sensorLib.read();
        // Imprimimos por pantalla
        // console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%');
        // Datos a enviar
        var msg = {};
        // ID
        msg.raspberry = rasp_id;
        // Temperatura y humedad
        msg.temperautra = readout.temperature.toFixed(2);
        msg.humedad = readout.humidity.toFixed(2);
        // Fecha actual
        msg.created_at = (new Date()).toString();
        // Comvertimos el objeto a String de JSON y mandamos
        push_sock.send(JSON.stringify(msg));
        // Esperamos readTime milisegundos y volvemos a leer
        setTimeout(function () {
            sensor.read();
        }, readTime);
    },
    // Fuction para leer un unico dato
    readOne: function() {
        // Leemos
        var readout = sensorLib.read();
        // Imprimimos por pantalla
        // console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' + 'humidity: ' + readout.humidity.toFixed(2) + '%');
        // Datos a enviar
        var msg = {};
        // ID
        msg.raspberry = rasp_id;
        // Temperatura y humedad
        msg.temperautra = readout.temperature.toFixed(2);
        msg.humedad = readout.humidity.toFixed(2);
        // Fecha actual
        msg.created_at = (new Date()).toString();
        // devolvemos el mensaje
        return msg;
    }
};

// Inicializamos y empezamos la lectura
if (sensor.initialize()) {
    sensor.read();
} else {
    console.warn('Failed to initialize sensor');
    process.exit();
}

// Cuando nos llega un mensaje a sub, llamamos a leer del sensor
sub.on("message", function(msg) {
    var send_msg = sensor.readOne();
    push_sock.send(JSON.stringify(send_msg));
});
