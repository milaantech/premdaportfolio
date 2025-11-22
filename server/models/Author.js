const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  name: String,
  tagline: String,
  bio: String,
  avatar: String,
  social: {
    instagram: String,
    goodreads: String,
    twitter: String
  },
  stats: [{ label: String, value: String }]
}, { timestamps: true });

module.exports = mongoose.model('Author', AuthorSchema);
