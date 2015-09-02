#node.js

## 초기설정

* npm
	* `npm install`
	* amqp.node 사용

## 튜토리얼 1
* Hello, World!
	* 간단하게 메시지 보내고 받기
		* `t1_send.js` 
		* `t1_listen.js` 
	* RabbitMQ 서버에 연결
		* `amqp.connect('amqp://guest:guest@localhost:5672', function(err, conn) {});`
	* 채널 생성하기
		* `conn.createChannel(function(err, ch) {});`
	* 메시지를 전송 / 수신하기 위해서는 **_Queue_**를 선언해줘야함.
		* testQ라는 Queue 만들기
			* `var q = 'testQ'`
			* `ch.assertQueue(q, {durable: false});`
		* testQ에 메시지 보내기
			* `ch.sendToQueue(q, new Buffer('Hello World!'));`
		* testQ에서 메시지 받기
			* `ch.consume(q, function(msg) {`
			* `console.log(" [x] Received %s", msg.content.toString());`
			* `}, {noAck: true});`
	* **_Queue_**는 존재하지 않는 경우에만 생성됨.
	* 먼저 `node t1_send` 로 **_testQ_**라는 **_Queue_**에 메시지를 전송해보자.
		![send](/nodejs/static/t1_send.png)
		![send console](/nodejs/static/t1_produce.png) 
	* 그 다음 `node t1_listen`으로 **_testQ_**라는 **_Queue_**에 있는 메시지를 읽으면!
		![listen](/nodejs/static/t1_listen.png)
		![consume](/nodejs/static/t1_consume.jpg) 
	
