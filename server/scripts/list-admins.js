require('dotenv').config();
const mongoose = require('mongoose');

async function listAdmins(){
  const uri = process.env.MONGO_URI;
  if(!uri){
    console.error('MONGO_URI not set in .env');
    process.exit(2);
  }
  try{
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const AdminUser = require('../models/AdminUser');
    const docs = await AdminUser.find().lean();
    console.log('Found', docs.length, 'admin users');
    docs.forEach(d => {
      console.log(JSON.stringify({ id: d._id, username: d.username, createdAt: d.createdAt }, null, 2));
    });
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error listing admin users:', err && (err.stack || err.message || err));
    process.exit(1);
  }
}

listAdmins();
