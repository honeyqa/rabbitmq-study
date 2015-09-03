var amqp = require('amqplib/callback_api');

amqp.connect('amqp://guest:guest@localhost:5672', function(err, conn) {
	conn.createChannel(function(err, ch) {
		var q = 'testQ_2';
		var msg = process.argv.slice(2).join(' ') || "Hello World!";
		ch.assertQueue(q, {durable: false});
		ch.sendToQueue(q, new Buffer(msg), {persistent: true});
		console.log(" [!] Sent '%s'", msg);
	});
	setTimeout(function() { conn.close(); process.exit(0) }, 500);
});