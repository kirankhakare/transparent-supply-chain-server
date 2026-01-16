require('dotenv').config(); // 👈 MUST be at top

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');

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

/* TEST ROUTE (IMPORTANT FOR RENDER) */
app.get('/', (req, res) => {
  res.send('API is running successfully 🚀');
});

/* PORT */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
