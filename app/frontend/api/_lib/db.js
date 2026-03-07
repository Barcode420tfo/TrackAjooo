const mongoose = require('mongoose');

let cachedConnection = null;

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

module.exports = { connectDb };
