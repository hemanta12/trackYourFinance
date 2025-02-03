require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const passport = require('passport');
const session = require('express-session');
require('./config/passport');



const app = express();
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Session setup for Google OAuth
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());


const authRoutes = require('./routes/authRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const listRoutes = require('./routes/listRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const analyticsRoutes = require('./routes/analyticsRoute'); 
const fileUploadRoutes = require('./routes/fileUploadRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes); 
app.use('/api/lists', listRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/upload', fileUploadRoutes);





const PORT = process.env.PORT || 5000 ;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
