var amqp = require('amqplib/callback_api');

amqp.connect('amqp://guest:guest@localhost:5672', function(err, conn) {
	conn.createChannel(function(err, ch) {
		var q = 'testQ';
		ch.assertQueue(q, {durable: false});
		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
		ch.consume(q, function(msg) {
			console.log(" [!] Received %s", msg.content.toString());
		}, {noAck: true});
	});
});