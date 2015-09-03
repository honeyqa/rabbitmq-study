var amqp = require('amqplib/callback_api');
var express = require('express');

var app = express();

var QUEUE_NAME = 'expressTest';

function startServer(c){
	var ch = c;

	app.post('/queue/:msg', function (req, res) {
		ch.assertQueue(QUEUE_NAME, {durable: false});
		ch.sendToQueue(QUEUE_NAME, new Buffer(req.params.msg));
		res.json({ msg: req.params.msg });
	});

	app.listen(8080);
}

amqp.connect('amqp://guest:guest@localhost:5672', function(err, conn) {
	if (err != null){
		console.error(err);
		process.exit(1);
	}
	conn.createChannel(function(err, ch) {
		if (err != null){
			console.error(err);
			process.exit(1);
		}
		startServer(ch);
	});
});

