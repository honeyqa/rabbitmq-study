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

## 튜토리얼 2
* Work Queues
	* 1 Producer / 2 Consumer 
		* `t2_task.js`
		* `t2_worker.js`
	* task에서 주어지는 메시지에 있는 마침표 수만큼의 시간이 메시지를 처리하는데 걸리게 되어있음.
	* 터미널을 총 3개를 띄우고 
		* 첫번째 / 두번째 터미널에
			* `node t2_worker`
		* 마지막 터미널에
			* `node t2_task First message.`
			* `node t2_task Second message..`
			* `node t2_task Third message...`
			* `node t2_task Fourth message....`
			* `node t2_task Fifth message.....`
		* 그러면
			* 첫번째 터미널에는
				* `[!] Received 'First message.'`
				* `[!] Received 'Third message...'`
				* `[!] Received 'Fifth message.....'`
			* 두번째 터미널에는
				* `[!] Received 'Second message..'`
				* `[!] Received 'Fourth message....'`
			* 라고 출력이 된다, (Round-robin)
	* 현재 짜여진 t2 코드는 메시지가 전달이 되면 바로 메모리에서 삭제됨.
		* Worker를 죽이면 메시지가 사라짐 (!)
			* 해당 Worker에 대기중인 메시지도 삭제됨 (!)
		* 해결방법
			* **_message acknowledgments_**
				* Consumer가 메시지를 처리한 뒤 RabbitMQ한테 삭제해도 좋다고 알려주면 됨.
				* Consumer가 ack을 전송하지 않고 죽으면 RabbitMQ가 메시지가 처리되지 않았다고 판단해 다른 Consumer에게 다시 전달함.
				* message timeout이 없음.
					* Worker와의 연결이 끊긴 경우에만 다시 전달함.
				* 기본적으로는 꺼져있으나, `{noAck: false}` 옵션으로 사용 가능
				* 처리한 뒤 `ch.ack(msg);`
	* 위에서 Consumer가 죽어도 Task가 삭제되지 않게 처리를 했지만, RabbitMQ 서버가 멈추는 경우 Task가 사라짐.
		* RabbitMQ 서버가 죽거나 Crash하는 경우 **_Queue_**와 메시지가 없어짐.
			* **_Queue_**와 메시지 모두 durable하게 표시해야함.
			* 기존에 짰던 코드를
				* `ch.assertQueue(q, {durable: true});`
				* **로 고치면 안됨.**
			* RabbitMQ는 존재하는 **_Queue_**를 재정의하는걸 허용하지 않음.
				* **_Queue_** 이름을 바꾸면 해결!
				* RabbitMQ가 재시작해도 durable한 Queue는 없어지지 않음.
				* 메시지에도 다음과 같이 persistent 옵션을 주면 끝!
					* `ch.sendToQueue(q, new Buffer(msg), {persistent: true});`
					* 하지만 persistent 옵션을 주더라도 메시지가 없어지지 않는다고 보장되지 않음.
						* 더 높은 보장성을 원한다면 **_publisher confirms_**를 사용
	* 균등하게 분배하기
		* `ch.prefetch(1);`를 이용해서 특정 worker가 일을 처리하기 전까지 해당 worker에 메시지를 보내지 않음.
			* 대신에 다른 바쁘지 않은 worker에게 전송
		* **_Queue_**가 가득 찰 수 있으므로 Worker를 더 추가하거나 다른 방법을 사용해서 해결해야함.