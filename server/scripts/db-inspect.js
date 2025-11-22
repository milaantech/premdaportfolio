require('dotenv').config();
const mongoose = require('mongoose');

async function inspect(){
  // Build connection URI and allow overriding only the database name portion via MONGO_DB_NAME
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
        const prefix = withoutQuery.slice(0, lastSlash + 1);
        uri = prefix + overrideDb + query;
        console.log('[scripts/db-inspect] MONGO_DB_NAME override applied - using DB:', overrideDb);
      }
    }catch(e){ console.warn('[scripts/db-inspect] Failed to apply MONGO_DB_NAME override:', e && e.message); }
  }
  if(!uri) uri = rawUri;
  if(!uri){ console.error('MONGO_URI not set'); process.exit(2); }
  try{
    console.log('Connecting to', uri.replace(/(:).*@/, ':***@'));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected.');

    const Book = require('../models/Book');
    const Blog = require('../models/Blog');

    const bookCount = await Book.countDocuments();
    const blogCount = await Blog.countDocuments();
    console.log('books count =', bookCount);
    console.log('blogs count =', blogCount);

    const b = await Book.findOne().lean();
    const bl = await Blog.findOne().lean();
    console.log('\nSample book:', b ? JSON.stringify({ _id: b._id, title: b.title, images: b.images && b.images.slice(0,1) }, null, 2) : 'NONE');
    console.log('\nSample blog:', bl ? JSON.stringify({ _id: bl._id, title: bl.title, image: bl.image }, null, 2) : 'NONE');

    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Inspect failed:', err && (err.stack || err.message || err));
    process.exit(1);
  }
}

inspect();
