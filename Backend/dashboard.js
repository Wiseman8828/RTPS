const express = require('express');
const http = require('http');
const amqp = require('amqplib');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:5173", // Allow only this origin for socket connections
      methods: ["GET", "POST"]
    }
  });

const QUEUES = ['orders', 'fulfillment'];

// Connect to RabbitMQ
async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@127.0.0.1:5672');
    const channel = await connection.createChannel();
    
    // Assert queues to ensure they exist
    for (const queue of QUEUES) {
      await channel.assertQueue(queue);
    }
    console.log('Connected to RabbitMQ');
    
    return channel;
  } catch (err) {
    console.error('RabbitMQ connection failed:', err);
    throw err;
  }
}

// Store the RabbitMQ channel for emitting messages
let channel;

// Socket.IO connection to receive data from the frontend

io.on('connect', (socket) => {
  console.log('Client connected to dashboard');

  socket.on('place-order', async (data) => {
    try {
      const { queue, payload } = data;
      if (QUEUES.includes(queue)) {
        // Send the data to the appropriate queue
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
        console.log(`Sent payload to ${queue}:`, payload);
      } else {
        console.log(`Invalid queue: ${queue}`);
      }
    } catch (err) {
      console.error('Error sending payload to RabbitMQ:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, async () => {
  console.log('Dashboard Service running on http://localhost:4000');
  try {
    channel = await connectRabbitMQ();
  } catch (err) {
    console.error('Failed to connect to RabbitMQ');
  }
});
