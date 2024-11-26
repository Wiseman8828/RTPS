const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

const app = express();
app.use(bodyParser.json());

let channel, connection;
const QUEUE = 'orders';

// Connect to RabbitMQ
async function connectRabbitMQ() {
    try {
        connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE);
        console.log('Order Placement Service connected to RabbitMQ');
    } catch (err) {
        console.error('RabbitMQ connection failed:', err);
    }
}

// API to place a new order
app.post('/place-order', async (req, res) => {
    const order = req.body; // { id, customerName, items }
    if (!order.id || !order.customerName || !order.items) {
        return res.status(400).send('Invalid order data');
    }

    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(order)));
    console.log('Order sent:', order);
    res.status(200).send({ message: 'Order placed successfully', order });
});

app.listen(3000, () => {
    console.log('Order Placement Service running on http://localhost:3000');
    connectRabbitMQ();
});
