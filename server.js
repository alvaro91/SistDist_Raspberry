// ZMQ y sensor
var zmq = require("zmq");

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
//Me conecto al servidor de mongo
var mongoHost = 'localHost';
var mongoPort = 27017;
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //Me creo el cliente de mongo

// IP y puerto
var server_ip = "85.219.25.246";
var server_pull_port = 3001;
//var server_pub_port = 3002;


// Socket pull
var pull_sock = zmq.socket("pull");
// Conexion
pull_sock.bind("tcp://" + server_ip + ":" + server_pull_port);
pull.on("message", function (msg) {
    var obj = JSON.parse(msg);

    mongoClient.open(function (err, mongoClient) { //C
        if (!mongoClient) { //Si hay algun error conectando con mongo
            console.error("Error! Exiting... No se ha encontrado el servidor de mongoDB");
            process.exit(1);
        }
        var db = mongoClient.db("MyDatabase");  //Me conecto a la DB correcta


        db.collection('items').insert(obj, function (err, records) {
            if (err) throw err;
            console.log("Añadido item como " + records[0]._id);
            console.log("----------------------------");
        });

    });

});



