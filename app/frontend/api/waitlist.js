const Waitlist = require('../server/models/Waitlist');
const { connectDb } = require('./_lib/db');
const { setCors, handleOptions } = require('./_lib/cors');
const { readJsonBody } = require('./_lib/body');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) {
        return;
    }

    setCors(res);

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        await connectDb();
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
