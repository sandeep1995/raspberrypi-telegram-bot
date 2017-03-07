var sensorLib = require('node-dht-sensor');

var dhtPin = 4;

sensorLib.initialize(11, dhtPin);

function getTemp() {
  return sensorLib.read().temperature.toFixed(0) + '°C';
}

function getHumidity() {
  return sensorLib.read().humidity.toFixed(0) + '%';
}

setInterval(function () {
  console.log("Temp is: " + getTemp());
  console.log("Humidity is: " + getHumidity());
}, 2000);
