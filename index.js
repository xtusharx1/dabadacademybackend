const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const cors = require('cors');
const http = require('http');
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
const AttendanceRoutes = require('./routes/AttendanceRoutes');
const subjectRoutes = require('./routes/SubjectRoutes');
const WhatsAppRoutes = require('./routes/whatsapproutes');
const visitsRoutes = require('./routes/visits');
const schoolRoutes = require('./routes/schools');
const marketingPersonnel = require('./routes/marketingPersonnel')
const teacherReportRoutes = require("./routes/teacherReport");

dotenv.config();

const app = express();;
app.use(bodyParser.json());
app.use(cors());
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Unable to sync database:', err));

const server = http.createServer(app);


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
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api/whatsapp', WhatsAppRoutes);
app.use('/api/schools',schoolRoutes);
app.use('/api/marketing-personnel',marketingPersonnel);
app.use('/api/visits',visitsRoutes);
app.use('/api/teacher-report',teacherReportRoutes)
app.get('/', (req, res) => res.send('Welcome to the Dabad Academy API'));

const PORT = 3002;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
