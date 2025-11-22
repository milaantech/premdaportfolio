require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup(){
  const uri = process.env.MONGO_URI;
  if(!uri){ console.error('MONGO_URI not set in .env'); process.exit(2); }
  try{
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const Book = require('../models/Book');
    const Author = require('../models/Author');
    const sampleData = require('../data/sampleData');

    const titles = (sampleData.SAMPLE_BOOKS || []).map(b => b.title);
    if(titles.length){
      const res = await Book.deleteMany({ title: { $in: titles } });
      console.log('Deleted sample books:', res.deletedCount);
    }

    if(sampleData.SAMPLE_AUTHOR && sampleData.SAMPLE_AUTHOR.name){
      const name = sampleData.SAMPLE_AUTHOR.name;
      const res2 = await Author.deleteMany({ name });
      console.log('Deleted sample authors:', res2.deletedCount);
    }

    await mongoose.disconnect();
    console.log('Cleanup complete.');
    process.exit(0);
  }catch(err){
    console.error('Cleanup failed:', err && (err.stack || err.message || err));
    process.exit(1);
  }
}

cleanup();
