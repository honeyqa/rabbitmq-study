var amqp = require('amqplib/callback_api');

amqp.connect('amqp://guest:guest@localhost:5672', function(err, conn) {
	conn.createChannel(function(err, ch) {
		var q = 'testQ';
		ch.assertQueue(q, {durable: false});
		ch.sendToQueue(q, new Buffer("Hello, World!"));
		console.log(" [!] Message Sent ");
	});
	setTimeout(function() { conn.close(); process.exit(0) }, 500);
});