require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const booksRouter = require('./routes/books');
const authorRouter = require('./routes/author');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const blogsRouter = require('./routes/blogs');
const uploadsRouter = require('./routes/uploads');
// const seedRouter = require('./routes/seed');
const adminRouter = require('./routes/admin');

const app = express();

// Configure CORS so your Vercel frontend can call this Render-hosted API.
// Keep flexible behavior: allow an optional FRONTEND_URL env var, the Render origin,
// and common localhost dev origins. Also allow requests with no origin (server-to-server, curl).
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'https://premdaportfolio.onrender.com', // Render service URL (backend)
  'https://premdaportfolio-dqd4.vercel.app', // your Vercel frontend
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);
console.log('[cors] Allowed origins:', ALLOWED_ORIGINS.join(', ') || 'none');

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (mobile apps, curl, server-to-server)
    if(!origin) return callback(null, true);
    if(ALLOWED_ORIGINS.indexOf(origin) !== -1) return callback(null, true);
    console.warn('[cors] Rejected origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Global error handlers to avoid crashes
process.on('unhandledRejection', (reason, p) => {
  console.error('[process] Unhandled Rejection at:', p, 'reason:', reason && reason.message ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught Exception:', err && err.stack ? err.stack : err);
});

// Start server immediately so API can accept requests even if Mongo is temporarily unreachable.
function startServer(){
  // API routes
  app.use('/api/books', booksRouter);
  app.use('/api/author', authorRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/blogs', blogsRouter);
  app.use('/api/uploads', uploadsRouter);
  // serve uploaded files
  const path = require('path');
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api/admin', adminRouter);

  app.get('/', (req, res) => res.send({ ok: true, msg: 'Book frontend API running' }));

  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

startServer();

// Try to connect to MongoDB with retry logic in background
async function tryConnect(options = {}){
  const {
    retries = 6,
    initialDelayMs = 3000,
    serverSelectionTimeoutMS = 10000
  } = options;

  // Allow overriding only the database name portion of the MONGO_URI via MONGO_DB_NAME
  const rawUri = process.env.MONGO_URI;
  let uri = rawUri;
  const overrideDb = process.env.MONGO_DB_NAME;
  if(rawUri && overrideDb){
    try{
      const qIdx = rawUri.indexOf('?');
      const query = qIdx >= 0 ? rawUri.slice(qIdx) : '';
      const withoutQuery = qIdx >= 0 ? rawUri.slice(0, qIdx) : rawUri;
      const lastSlash = withoutQuery.lastIndexOf('/');
      if(lastSlash !== -1){
        const prefix = withoutQuery.slice(0, lastSlash + 1); // keep the trailing slash
        uri = prefix + overrideDb + query;
        console.log('[mongo] MONGO_DB_NAME override applied - using DB:', overrideDb);
      }
    }catch(e){ console.warn('[mongo] Failed to apply MONGO_DB_NAME override:', e && e.message); }
  }
  if(!uri) uri = rawUri;
  if(!uri){
    console.error('[mongo] MONGO_URI is not set. Please set MONGO_URI in server/.env (e.g. mongodb://localhost:27017/yourdb)');
    return;
  }

  // Basic validation of URI scheme to provide clearer error messages
  if(!(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))){
    console.error('[mongo] Invalid MONGO_URI scheme. Expected mongodb:// or mongodb+srv:// — got:', uri.slice(0, 80) + (uri.length > 80 ? '...' : ''));
    return;
  }

  const opts = { serverSelectionTimeoutMS };
  let attempt = 0;
  let delayMs = initialDelayMs;

  while(attempt < retries){
    attempt += 1;
    try{
      console.log(`[mongo] Attempting to connect to MongoDB (attempt ${attempt}/${retries})`);
      await mongoose.connect(uri, opts);
      console.log('[mongo] Connected to MongoDB');

      mongoose.connection.on('error', (err) => console.error('[mongo] connection error:', err && err.message));
      mongoose.connection.on('disconnected', () => console.warn('[mongo] disconnected from server'));
      mongoose.connection.on('connected', () => console.log('[mongo] connected event received'));

      // After connect, try seeding (if empty) and flush queue
      try{
        // Automatic seeding of sample data is dangerous on shared/production DBs.
        // Only run seeding when ALLOW_DB_SEED=true in .env (explicit opt-in).
        if(process.env.ALLOW_DB_SEED === 'true'){
          const Book = require('./models/Book');
          const Author = require('./models/Author');
          const { SAMPLE_BOOKS, SAMPLE_AUTHOR } = require('./data/sampleData');
          const bookCount = await Book.countDocuments();
          const authorCount = await Author.countDocuments();
          if(bookCount === 0 && Array.isArray(SAMPLE_BOOKS) && SAMPLE_BOOKS.length){
            await Book.insertMany(SAMPLE_BOOKS);
            console.log('Seeded sample books into MongoDB');
          }
          if(authorCount === 0 && SAMPLE_AUTHOR){
            await Author.create(SAMPLE_AUTHOR);
            console.log('Seeded sample author into MongoDB');
          }
        } else {
          console.log('[seed] Skipping automatic DB seeding (ALLOW_DB_SEED not set).');
        }
      }catch(err){
        console.warn('Seeding skipped or failed after connect:', err && err.message);
      }

      // Flush queued orders if any
      try{
        const ordersQueue = require('./lib/ordersQueue');
        await ordersQueue.processQueue();
      }catch(e){ console.warn('[ordersQueue] process error', e && e.message); }

      // Auto-migrate legacy admin env creds into DB if needed
      try{
        const AdminUser = require('./models/AdminUser');
        const bcrypt = require('bcrypt');
        const adminCount = await AdminUser.countDocuments();
        const envAdminUser = process.env.ADMIN_USER;
        const envAdminPass = process.env.ADMIN_PASSWORD;
        if(adminCount === 0 && envAdminUser && envAdminPass){
          console.log('[admin-seed] No admin users found — creating one from ADMIN_USER env vars');
          const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
          const hash = await bcrypt.hash(envAdminPass, rounds);
          await AdminUser.create({ username: envAdminUser, passwordHash: hash, role: 'admin' });
          console.log('[admin-seed] Created admin user:', envAdminUser);
        }
      }catch(err){
        console.warn('[admin-seed] Skipped admin creation:', err && err.message);
      }

      // successful connect -> exit loop
      return;
    }catch(err){
      console.warn(`[mongo] Connection attempt ${attempt} failed:`, err && (err.message || err));
      if(attempt >= retries){
        console.error('[mongo] All connection attempts failed. Last error:', err && err.stack ? err.stack : err);
        break;
      }
      console.log(`[mongo] Retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
      delayMs = Math.min(30000, Math.floor(delayMs * 1.8));
    }
  }
  console.error('[mongo] Unable to establish MongoDB connection. Please check MONGO_URI, network access, and credentials. Use server/test-mongo.js for a quick test.');
}

// start background connect attempts
tryConnect();
