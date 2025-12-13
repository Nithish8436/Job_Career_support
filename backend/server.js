const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Career Compass API is running',
        version: '1.0.0',
        endpoints: {
            upload: '/api/upload',
            match: '/api/match',
            auth: '/api/auth'
        }
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/match', require('./routes/match'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/progress', require('./routes/progress'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
