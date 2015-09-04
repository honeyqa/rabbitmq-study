var amqp = require('amqplib/callback_api');
var mysql = require('mysql');

var QUEUE_NAME = 'expressTest';

function listen(ch, connection){
	console.log(" [!] Ready for Message");
	ch.assertQueue(QUEUE_NAME, {durable: false});
	ch.consume(QUEUE_NAME, function(msg) {
		connection.query('INSERT INTO test SET ?',{msg:msg.content.toString()}, function(err, results) {
  			if(err != null){
  				console.error(err);
  			}else{
  				console.log(" [!] Message inserted");
  			}
		});
		console.log(" [!] Received %s", msg.content.toString());
	}, {noAck: true});
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
		var connection = mysql.createConnection({
				host : '127.0.0.1',
				user : 'root',
				password : '',
				database : 'test'
		});
		connection.connect(function(err) {
  			if (err) {
    			console.error('error connecting: ' + err.stack);
    			process.exit(1);
  			}
  			listen(ch, connection);
		});
	});
});

