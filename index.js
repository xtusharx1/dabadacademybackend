    const express = require('express');
    const bodyParser = require('body-parser');
    const dotenv = require('dotenv');
    const sequelize = require('./config/db');
    const cors = require('cors'); // Import CORS package

    // Import all route files
    const userRoutes = require('./routes/user');
    const attendanceRoutes = require('./routes/AttendanceRoutes');
    const feePaymentRoutes = require('./routes/FeePaymentRecordRoutes');
    const feeStatusRoutes = require('./routes/FeeStatusRoutes');
    const noticeRoutes = require('./routes/NoticeRoutes');
    const documentRoutes = require('./routes/studentDocumentRoutes');
    const OtherChargesRecordRoutes = require('./routes/OtherChargesRecordRoutes');
    const batchRoutes = require('./routes/BatchRoutes');  // Import the batch routes
    const studentBatchRoutes = require('./routes/StudentBatchRoutes');  // Import the student-batch routes
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

    // Register routes
    app.use('/api/users', userRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/feepaymentrecords', feePaymentRoutes);
    app.use('/api/feestatus', feeStatusRoutes);
    app.use('/api/notices', noticeRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/otherchargesrecords', OtherChargesRecordRoutes);
    app.use('/api/batches', batchRoutes);  // Batch related routes
    app.use('/api/studentBatches', studentBatchRoutes);  // StudentBatch related routes
    app.use('/api/role', RoleRoutes);  // StudentBatch related routes
    app.use('/api/test',TestRoutes);    
    app.use('/api/studenttestrecords',StudentTestRecordsRoutes); 
    // Default route for the server
    app.get('/', (req, res) => {
        res.send('Welcome to the School Management API');
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
