# TrackAjo API - Backend Setup

## Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Set your MongoDB connection string:
```bash
export MONGO_URI="mongodb://localhost:27017/trackajo"
# Or for MongoDB Atlas:
export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/trackajo"
```

3. Start the server:
```bash
npm start
```

The API will run on `http://localhost:5000`.

## API Endpoints

### POST /api/waitlist
Add a new entry to the waitlist.

**Body:**
```json
{
    "email": "user@example.com",
    "phone": "+234 800 000 0000"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Successfully joined the waitlist!",
    "count": 42
}
```

### GET /api/waitlist/count
Get the total number of waitlist entries.

**Response:**
```json
{
    "success": true,
    "count": 42
}
```

### GET /api/health
Health check endpoint.

## Frontend Configuration

Update the `API_BASE` variable in `script.js` to point to your deployed backend URL:
```javascript
const API_BASE = 'https://your-backend-url.com';
```

## Deployment
- **Backend**: Deploy to Render, Railway, or Heroku
- **Frontend**: Deploy to Netlify, Vercel, or any static hosting
- **Database**: Use MongoDB Atlas for cloud database