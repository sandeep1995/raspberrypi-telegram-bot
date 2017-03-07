var RaspiCam = require("raspicam");


var camera = new RaspiCam({
	mode: "photo",
	output: "./photo/image.jpg",
	encoding: "jpg",
	timeout: 0 // take the picture immediately
});

camera.on("start", function( err, timestamp ){
	console.log("Photo started at " + timestamp );
});

camera.on("read", function( err, timestamp, filename ){
	console.log("Photo image captured with filename: " + filename );
});

camera.on("exit", function( timestamp ){
	console.log("Photo child process has exited at " + timestamp );
});

camera.start();
