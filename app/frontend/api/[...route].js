const mongoose = require('mongoose');
const Waitlist = require('../server/models/Waitlist');

let cachedConnection = null;

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function normalizeRoute(req) {
    const segments = req.query.route;
    if (!segments) {
        return '/';
    }

    if (Array.isArray(segments)) {
        return '/' + segments.join('/');
    }

    return '/' + String(segments);
}

async function connectDb() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not configured');
    }

    cachedConnection = await mongoose.connect(uri);
    return cachedConnection;
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string') {
        return req.body ? JSON.parse(req.body) : {};
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }

    if (chunks.length === 0) {
        return {};
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
}

module.exports = async function handler(req, res) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        await connectDb();
        const routePath = normalizeRoute(req);

        if (req.method === 'GET' && routePath === '/health') {
            return res.status(200).json({ status: 'ok', message: 'TrackAjo API is running' });
        }

        if (req.method === 'GET' && routePath === '/waitlist/count') {
            const count = await Waitlist.countDocuments();
            return res.status(200).json({ success: true, count });
        }

        if (req.method === 'POST' && routePath === '/waitlist') {
            const body = await readJsonBody(req);
            const email = body.email ? String(body.email).trim().toLowerCase() : '';
            const phone = body.phone ? String(body.phone).trim() : '';

            if (!email && !phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide an email or phone number.'
                });
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a valid email address.'
                });
            }

            const entry = new Waitlist({ email, phone });
            await entry.save();
            const count = await Waitlist.countDocuments();

            return res.status(201).json({
                success: true,
                message: 'Successfully joined the waitlist!',
                count
            });
        }

        return res.status(404).json({ success: false, message: 'Not found' });
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This contact is already on the waitlist!'
            });
        }

        return res.status(500).json({
            success: false,
            message: err && err.message ? err.message : 'Something went wrong. Please try again.'
        });
    }
};
