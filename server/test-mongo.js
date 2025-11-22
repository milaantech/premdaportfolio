// Simple Mongo connectivity tester
// Usage:
//   node --trace-deprecation test-mongo.js
//   or
//   node --trace-deprecation test-mongo.js "mongodb+srv://user:pass@..."

require('dotenv').config();
const mongoose = require('mongoose');

const uriArg = process.argv[2];
const MONGO_URI = uriArg || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('No MONGO_URI provided. Set it in .env or pass it as the first argument.');
  process.exit(2);
}

console.log('Testing MongoDB connection...');
console.log('Using URI: ' + (uriArg ? uriArg : '[from .env]'));

async function test() {
  try {
    // Use a short serverSelectionTimeoutMS so it fails fast for testing
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });

    console.log('Connected to MongoDB successfully.');
    console.log('mongoose.connection.readyState =', mongoose.connection.readyState);

    // Close and exit
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mongo connection failed. Full error below:');
    // Print stack and full object if present
    if (err && err.stack) console.error(err.stack);
    else console.error(err);

    // If mongoose has a .connection and .readyState, print it
    try {
      console.error('mongoose.connection.readyState =', mongoose.connection && mongoose.connection.readyState);
    } catch (e) {
      // ignore
    }

    process.exit(1);
  }
}

test();
