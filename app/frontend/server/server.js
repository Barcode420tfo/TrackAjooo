require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Waitlist = require('./models/Waitlist');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection string - replace with your MongoDB Atlas URI or local URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trackajo';

// Middleware
app.use(cors());
app.use(express.json());

// POST - Add to waitlist
app.post('/api/waitlist', async function(req, res) {
    try {
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email or phone number.'
            });
        }

        // Check for duplicate email
        if (email) {
            const existingEmail = await Waitlist.findOne({ email: email.toLowerCase().trim() });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already on the waitlist!'
                });
            }
        }

        // Check for duplicate phone
        if (phone) {
            const existingPhone = await Waitlist.findOne({ phone: phone.trim() });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'This phone number is already on the waitlist!'
                });
            }
        }

        const entry = new Waitlist({
            email: email ? email.toLowerCase().trim() : '',
            phone: phone ? phone.trim() : ''
        });

        await entry.save();

        const count = await Waitlist.countDocuments();

        res.status(201).json({
            success: true,
            message: 'Successfully joined the waitlist!',
            count: count
        });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This contact is already on the waitlist!'
            });
        }

        console.error('Error saving to waitlist:', err.message);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// GET - Get waitlist count
app.get('/api/waitlist/count', async function(req, res) {
    try {
        const count = await Waitlist.countDocuments();
        res.json({
            success: true,
            count: count
        });
    } catch (err) {
        console.error('Error getting count:', err.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching waitlist count.'
        });
    }
});

// GET - Health check
app.get('/api/health', function(req, res) {
    res.json({ status: 'ok', message: 'TrackAjo API is running' });
});

// Start server only after DB is connected
async function startServer() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        app.listen(PORT, function() {
            console.log('TrackAjo API running on port ' + PORT);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

startServer();
