const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  price: Number,
  images: [String],
  description: String,
  genre: String,
  pages: Number,
  isbn: String,
  pubDate: Date,
  // External purchase/platform links
  amazonLink: String,
  flipkartLink: String,
  milaanLink: String,
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
