var Gpio = require('onoff').Gpio;
// GPIO 27 : not 13
var led = new Gpio(27, 'out');

var isOn = false;

function blink() {
    if (isOn) {
        led.writeSync(0);
        isOn = false;
    } else {
        led.writeSync(1);
        isOn = true;
    }
}

setInterval( blink, 1000);
