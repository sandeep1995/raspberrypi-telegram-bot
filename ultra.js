var usonic = require('mmm-usonic');

usonic.init(function (error) {
    if (error) {
        console.log(error);
    } else {
      var echoPin = 19;
      var triggerPin = 26;
      var sensor = usonic.createSensor(echoPin, triggerPin, 1500);

      function getDistance() {
        var distance = sensor();
        distance = distance.toFixed(0);
        console.log("The distance is:  " + distance + " cm");
      }

      setInterval( getDistance, 1000);
    }
});
