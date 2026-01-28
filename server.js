require('dotenv').config(); // 👈 MUST be at top

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

/* DB CONNECT */
connectDB();

/* MIDDLEWARES */
app.use(cors({
  origin: '*', // for mobile + web
}));
app.use(express.json());

/* ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/contractor', require('./routes/contractor.routes'));
app.use('/api/suppiler', require('./routes/supplier.routes'));
app.use('/api/user', require('./routes/user.routes'));
/* TEST ROUTE (IMPORTANT FOR RENDER) */
app.get('/', (req, res) => {
  res.send('API is running successfully ');
});

/* PORT */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
