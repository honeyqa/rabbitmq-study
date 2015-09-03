var amqp = require('amqplib/callback_api');

amqp.connect('amqp://guest:guest@localhost:5672', function(err, conn) {
	conn.createChannel(function(err, ch) {
		var q = 'testQ_2';
		ch.assertQueue(q, {durable: false});
		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
		ch.consume(q, function(msg) {
			var secs = msg.content.toString().split('.').length - 1;
			console.log(" [!] Received %s", msg.content.toString());
			setTimeout(function() {
				console.log(" [!] Done");
				ch.ack(msg);
			}, secs * 1000);
		}, {noAck: false});
	});
});