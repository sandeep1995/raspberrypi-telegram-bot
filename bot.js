var TelegramBot = require('node-telegram-bot-api');
var API_KEY = "<YOUR TELEGRAM API KEY>";
var exec = require('child_process').exec;

var Gpio = require('onoff').Gpio;
var usonic = require('mmm-usonic');
var sensorLib = require('node-dht-sensor');
var RaspiCam = require("raspicam");


var dhtPin = 4;
sensorLib.initialize(11, dhtPin);

var led = new Gpio(27, 'out');
var bot = new TelegramBot(API_KEY, {
    polling: true,
    filepath: true
});

var distance = null;
var maxDistance = 150;

var sandeep = 375681471;
var alert = false;
// Listen for any kind of message. There are different kinds of messages

bot.on('message', function(msg) {
    if (msg.chat.id != sandeep) {
      return bot.sendMessage(msg.chat.id, "Hello " + msg.chat.first_name + ", You are unauthorized");;
    }

    console.log(msg);
    var text = msg.text.toLowerCase();

    if (text.includes("hi")) {
        bot.sendMessage(sandeep, "Hello " + msg.chat.first_name);
    } else if (text == "/on") {
        // Turn On Led
        led.writeSync(1);
        bot.sendMessage(sandeep, "Turned On");
    } else if (text == "/off") {
        // Turn Off Led
        led.writeSync(0);
        bot.sendMessage(sandeep, "Turned Off");
    } else if (text == "/ison") {
        // Get led status
        var isOn = led.readSync();
        bot.sendMessage(sandeep, "Led is " + (isOn ? "On" : "Off"));
    } else if (text == "/temp") {
        var temp = getTemp();
        bot.sendMessage(sandeep, "Temperature is: " + temp);
    } else if (text == "/humidity") {
        var humidity = getHumidity();
        bot.sendMessage(sandeep, "Humidity is: " + humidity);
    } else if (text == "/distance") {
        bot.sendMessage(sandeep, "Current Distance is: " + distance + " cm");
    } else if (text == "/alerton") {
        bot.sendMessage(sandeep, "Fire and Theif Monitoring started");
        alert = true;
    } else if (text == "/alertoff") {
        bot.sendMessage(sandeep, "Fire and Theif Monitoring stopped");
        alert = false;
    } else if (text == "/photo") {
        bot.sendMessage(sandeep, "Trying to send a photo");
        captureAndSendImage(sandeep);
    } else {
        bot.sendMessage(sandeep, "Hi " + msg.chat.first_name + ", You can use /on or /off to control Light. Check Light status by /ison. Get temperature by /temp and humidity by /humidity. Calculate distance by /distance. To turn on the fire and thief notifications please send /alerton and to turn off, send /alertoff");
    }
});


usonic.init(function(error) {
    if (error) {
        console.log(error);
    } else {
        var echoPin = 19;
        var triggerPin = 26;
        var sensor = usonic.createSensor(echoPin, triggerPin, 1500);

        function getDistance() {
            distance = sensor();
            if (alert && distance < maxDistance) {
                bot.sendMessage(sandeep, "There is someone in the house");
                captureAndSendImage(sandeep);
            }
            distance = distance.toFixed(0);
            console.log("The distance is:  " + distance + " cm");
            var temperature = sensorLib.read().temperature.toFixed(0);
            console.log("Temperature is: " + temperature + " °C");
            if (alert && temperature > 35) {
                bot.sendMessage(sandeep, "ALERT! High Temperature. May be Fire in the House");

            }
        }

        setInterval(getDistance, 3000);
    }
});

function getTemp() {
    return sensorLib.read().temperature.toFixed(0) + '°C';
}

function getHumidity() {
    return sensorLib.read().humidity.toFixed(0) + '%';
}


function captureAndSendImage(sandeep) {
    var camera = new RaspiCam({
        mode: "photo",
        output: "./photo/image.jpg",
        encoding: "jpg",
        timeout: 0 // take the picture immediately
    });

    camera.start();

    camera.on("read", function(err, timestamp, filename) {
      if (err) {
        return console.log(err);
      }
        console.log("Photo image captured with filename: " + filename);
        bot.sendPhoto(sandeep, "./photo/image.jpg");
        setTimeout(function () {
          camera.stop();
        }, 1500)
    });

    camera.on("exit", function(timestamp) {
        console.log("Photo child process has exited at " + timestamp);
        setTimeout( clearImages, 3000);
    });
}

function clearImages() {

    exec('sudo rm -rf photo/*', (error, stdout, stderr) => {
        if (error) {
            console.error(`Remove error: ${error}`);
            return;
        }
        console.log("Removing Images");
    });
}

console.log("Bot Started");
