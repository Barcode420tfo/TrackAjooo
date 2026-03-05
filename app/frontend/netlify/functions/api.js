const mongoose = require('mongoose');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

let cachedConnection = null;

const waitlistSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

waitlistSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { email: { $exists: true, $ne: '' } } }
);
waitlistSchema.index(
    { phone: 1 },
    { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: '' } } }
);

waitlistSchema.pre('validate', function(next) {
    if (!this.email && !this.phone) {
        next(new Error('At least an email or phone number is required.'));
    } else {
        next();
    }
});

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);

function json(statusCode, payload) {
    return {
        statusCode,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    };
}

function getRoutePath(event) {
    if (event.pathParameters && event.pathParameters.splat) {
        return '/' + String(event.pathParameters.splat).replace(/^\/+/, '');
    }

    const fullPath = event.rawUrl ? new URL(event.rawUrl).pathname : (event.path || '');
    return fullPath
        .replace(/^\/\.netlify\/functions\/api/, '')
        .replace(/^\/api/, '') || '/';
}

async function connectDb() {
    if (cachedConnection) {
        return cachedConnection;
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not configured');
    }

    cachedConnection = await mongoose.connect(uri);
    return cachedConnection;
}

exports.handler = async function(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    try {
        await connectDb();
        const routePath = getRoutePath(event);

        if (event.httpMethod === 'GET' && routePath === '/health') {
            return json(200, { status: 'ok', message: 'TrackAjo API is running' });
        }

        if (event.httpMethod === 'GET' && routePath === '/waitlist/count') {
            const count = await Waitlist.countDocuments();
            return json(200, { success: true, count });
        }

        if (event.httpMethod === 'POST' && routePath === '/waitlist') {
            const body = event.body ? JSON.parse(event.body) : {};
            const email = body.email ? String(body.email).trim().toLowerCase() : '';
            const phone = body.phone ? String(body.phone).trim() : '';

            if (!email && !phone) {
                return json(400, {
                    success: false,
                    message: 'Please provide an email or phone number.'
                });
            }

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return json(400, {
                    success: false,
                    message: 'Please enter a valid email address.'
                });
            }

            const entry = new Waitlist({ email, phone });
            await entry.save();
            const count = await Waitlist.countDocuments();

            return json(201, {
                success: true,
                message: 'Successfully joined the waitlist!',
                count
            });
        }

        return json(404, { success: false, message: 'Not found' });
    } catch (err) {
        if (err && err.code === 11000) {
            return json(400, {
                success: false,
                message: 'This contact is already on the waitlist!'
            });
        }

        return json(500, {
            success: false,
            message: err && err.message ? err.message : 'Something went wrong. Please try again.'
        });
    }
};
