import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const [order, setOrder] = useState({ id: '', customerName: '', items: '' });
  const [orders, setOrders] = useState([]);
  const socket = io('http://localhost:4000'); // Connect to the backend Socket.IO server

  useEffect(() => {
    // Listen for updates from the server

    // socket.on('fulfillment', (fulfilledOrder) => {
    //   setOrders((prevOrders) =>
    //     prevOrders.map((order) =>
    //       order.id === fulfilledOrder.id ? fulfilledOrder : order
    //     )
    //   );
    // });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert items string to an array
    const orderPayload = {
      ...order,
      items: order.items.split(',').map((item) => item.trim()),
    };

    // Emit the 'place-order' event with the payload
    socket.emit('place-order', {
      queue: 'orders', // Or 'fulfillment' if it's a fulfillment order
      payload: orderPayload,
    });

    alert('Order submitted successfully');
    setOrder({ id: '', customerName: '', items: '' }); // Reset form
  };

  return (
    <div style={styles.container}>
      <h1>Order Dashboard</h1>

      {/* Order Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label>Order ID:</label>
          <input
            type="text"
            value={order.id}
            onChange={(e) => setOrder({ ...order, id: e.target.value })}
            required
          />
        </div>
        <div style={styles.field}>
          <label>Customer Name:</label>
          <input
            type="text"
            value={order.customerName}
            onChange={(e) =>
              setOrder({ ...order, customerName: e.target.value })
            }
            required
          />
        </div>
        <div style={styles.field}>
          <label>Items (comma-separated):</label>
          <input
            type="text"
            value={order.items}
            onChange={(e) => setOrder({ ...order, items: e.target.value })}
            required
          />
        </div>
        <button type="submit" style={styles.button}>
          Submit Order
        </button>
      </form>

      {/* Order Updates */}
      <h2>Order Updates</h2>
      <ul style={styles.list}>
        {orders.map((order) => (
          <li key={order.id} style={styles.listItem}>
            <strong>ID:</strong> {order.id} | <strong>Customer:</strong>{' '}
            {order.customerName} | <strong>Status:</strong>{' '}
            {order.status || 'Pending'} | <strong>Items:</strong>{' '}
            {order.items.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Styling
const styles = {
  container: {
    margin: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    marginBottom: '30px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  field: {
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    backgroundColor: '#f9f9f9',
    marginBottom: '10px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
};

export default Dashboard;
