require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const yargs = require('yargs');

const argv = yargs(process.argv.slice(2))
  .option('username', { type: 'string', describe: 'New username for the admin user' })
  .option('password', { type: 'string', describe: 'New password for the admin user' })
  .option('id', { type: 'string', describe: 'Admin user id to update (optional)' })
  .help()
  .argv;

async function update(){
  const uri = process.env.MONGO_URI;
  if(!uri){ console.error('MONGO_URI not set'); process.exit(2); }
  if(!argv.username && !argv.password){ console.error('Provide --username or --password to update'); process.exit(2); }
  try{
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const AdminUser = require('../models/AdminUser');
    let user;
    if(argv.id){ user = await AdminUser.findById(argv.id); }
    else { user = await AdminUser.findOne(); }
    if(!user){ console.error('No admin user found to update'); process.exit(3); }

    if(argv.username) user.username = argv.username;
    if(argv.password){
      const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
      user.passwordHash = await bcrypt.hash(argv.password, rounds);
    }
    await user.save();
    console.log('Updated admin user:', { id: user._id.toString(), username: user.username });
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error updating admin user:', err && (err.stack || err.message || err));
    process.exit(1);
  }
}

update();
