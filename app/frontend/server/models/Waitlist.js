const mongoose = require('mongoose');

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

// Uniqueness should only apply when a non-empty value exists.
waitlistSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { email: { $exists: true, $ne: '' } } }
);
waitlistSchema.index(
    { phone: 1 },
    { unique: true, partialFilterExpression: { phone: { $exists: true, $ne: '' } } }
);

// Ensure at least email or phone is provided
waitlistSchema.pre('validate', function(next) {
    if (!this.email && !this.phone) {
        next(new Error('At least an email or phone number is required.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
