var sensorLib = require('node-dht-sensor'),
            MongoClient = require('mongodb').MongoClient,
            Server = require('mongodb').Server;

//Me conecto al servidor de mongo
var mongoHost = 'localHost';
var mongoPort = 27017; 

var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //Me creo el cliente de mongo
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) { //Si hay algun error conectando con mongo
      console.error("Error! Exiting... No se ha encontrado el servidor de mongoDB");
      process.exit(1);
  }
  var db = mongoClient.db("MyDatabase");  //Me conecto a la DB correcta
  var sensor = {
        initialize: function () {
            return sensorLib.initialize(11, 4);
        },
        read: function () {
            var readout = sensorLib.read();
            console.log('Temperatura: ' + readout.temperature.toFixed(2) + 'C, ' + 'humedad: ' + readout.humidity.toFixed(2) + '%');

            //Genero el JSON que guardaré
            var document = { "raspberry": "Cuarto_Inigo", "humedad":readout.humidity.toFixed(2), "temperatura":readout.temperature.toFixed(2), "fecha":new Date()};

            db.collection('items').insert(document, function(err, records) {
                if (err) throw err;
                console.log("Añadido item como "+records[0]._id);
                console.log("----------------------------");
            });

            setTimeout(function () {
                sensor.read();
            }, 300000);
        }
    };

    if (sensor.initialize()) {
        sensor.read();
    } else {
        console.warn('Inicialización del sensor fallida');
    };

});

