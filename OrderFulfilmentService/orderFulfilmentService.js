const amqp = require('amqplib');

let channel, connection;
const FULFILLMENT_QUEUE = 'fulfillment';

// Connect to RabbitMQ
async function connectRabbitMQ() {
    try {
        connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
        channel = await connection.createChannel();
        await channel.assertQueue(FULFILLMENT_QUEUE);

        console.log('Order Fulfillment Service connected to RabbitMQ');
        channel.consume(FULFILLMENT_QUEUE, (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                console.log('Order fulfilled:', order);

                // Simulate fulfillment logic
                order.status = 'Fulfilled';
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error('RabbitMQ connection failed:', err);
    }
}

connectRabbitMQ();
