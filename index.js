const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

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
const StudentTestRecordsRoutes = require('./routes/Studenttestrecords');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Unable to sync database:', err));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    console.log(`Connection established with client at: ${new Date().toISOString()}`);

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        ws.send('Hello from the server');
    });

    ws.on('close', () => console.log('WebSocket connection closed'));
    ws.on('error', (error) => console.error(`WebSocket error: ${error.message}`));
});

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

app.get('/', (req, res) => res.send('Welcome to the Dabad API'));

const PORT = 3002;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
