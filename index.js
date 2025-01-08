const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const cors = require('cors'); // Import CORS package
const http = require('http'); // Import HTTP module to handle WebSocket on top of Express
const WebSocket = require('ws'); // Import the ws WebSocket library

// Import all route files
const userRoutes = require('./routes/user');
const attendanceRoutes = require('./routes/AttendanceRoutes');
const feePaymentRoutes = require('./routes/FeePaymentRecordRoutes');
const feeStatusRoutes = require('./routes/FeeStatusRoutes');
const noticeRoutes = require('./routes/NoticeRoutes');
const documentRoutes = require('./routes/studentDocumentRoutes');
const OtherChargesRecordRoutes = require('./routes/OtherChargesRecordRoutes');
const batchRoutes = require('./routes/BatchRoutes');  
const studentBatchRoutes = require('./routes/StudentBatchRoutes');  
const RoleRoutes = require('./routes/RoleRoutes');
const TestRoutes = require('./routes/tests');
const StudentTestRecordsRoutes = require('./routes/Studenttestrecords')

dotenv.config(); // Load environment variables

const app = express();
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // This will allow all origins

// Sync the database with models
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
    });

// Create an HTTP server to serve Express and WebSocket
const server = http.createServer(app);

// Create a WebSocket server on top of the HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');  // Log when a new connection is made

    // Log the connection details
    console.log(`Connection established with client at: ${new Date().toISOString()}`);

    // When a message is received from the client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);  // Log the received message from client
        // Optionally send a response back to the client
        ws.send('Hello from the server');
    });

    // When the WebSocket is closed
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    // Log any error that occurs
    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });
});

// Register Express routes
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feepaymentrecords', feePaymentRoutes);
app.use('/api/feestatus', feeStatusRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/otherchargesrecords', OtherChargesRecordRoutes);
app.use('/api/batches', batchRoutes); 
app.use('/api/studentBatches', studentBatchRoutes); 
app.use('/api/role', RoleRoutes); 
app.use('/api/test', TestRoutes);    
app.use('/api/studenttestrecords', StudentTestRecordsRoutes); 

// Default route for the server
app.get('/', (req, res) => {
    res.send('Welcome to the Dabad API');
});

// Start the server on port 3002
const PORT = 3002; // Use port 3002 as per your server configuration
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
