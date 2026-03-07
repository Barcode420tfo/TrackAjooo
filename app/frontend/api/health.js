const { connectDb } = require('./_lib/db');
const { setCors, handleOptions } = require('./_lib/cors');

module.exports = async function handler(req, res) {
    if (handleOptions(req, res)) {
        return;
    }

    setCors(res);

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        await connectDb();
        return res.status(200).json({ status: 'ok', message: 'TrackAjo API is running' });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err && err.message ? err.message : 'Health check failed'
        });
    }
};
