const amqp = require('amqplib');

let channel, connection;
const ORDER_QUEUE = 'orders';
const FULFILLMENT_QUEUE = 'fulfillment';

// Connect to RabbitMQ
async function connectRabbitMQ() {
    try {
        connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
        channel = await connection.createChannel();
        await channel.assertQueue(ORDER_QUEUE);
        await channel.assertQueue(FULFILLMENT_QUEUE);

        console.log('Order Processing Service connected to RabbitMQ');
        channel.consume(ORDER_QUEUE, (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                console.log('Processing order:', order);

                // Simulate processing logic
                order.status = 'Processed';
                channel.sendToQueue(FULFILLMENT_QUEUE, Buffer.from(JSON.stringify(order)));
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('RabbitMQ connection failed:', err);
        channel.nack(msg, false, true);
    }
}

connectRabbitMQ();
