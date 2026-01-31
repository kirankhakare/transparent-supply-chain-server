require('dotenv').config(); // 👈 MUST be at top

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const supplierRoutes = require('./routes/supplier.routes');
const contractorRoutes = require('./routes/contractor.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');
const chatRoutes = require('./routes/chat.routes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();

/* ================= PORT ================= */
const PORT = process.env.PORT || 5000;

/* ================= DB ================= */
connectDB();

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// optional (safe)
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

/* ================= ROUTES ================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contractor', contractorRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

/* ================= HEALTH ================= */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

/* ================= ROOT ================= */
app.get('/', (req, res) => {
  res.send('API is running successfully');
});

/* ================= SOCKET SETUP ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.set('io', io); // 👈 IMPORTANT for controllers

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log('📥 Joined room:', roomId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

/* ================= START SERVER ================= */
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
