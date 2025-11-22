const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // unique sparse index: ensures uniqueness for non-empty slugs while allowing documents
  // without a slug to exist. We'll run a dedupe helper before creating the index in prod.
  slug: { type: String, index: true, unique: true, sparse: true },
  image: String,
  excerpt: String,
  content: String,
  author: String,
  published: { type: Boolean, default: true },
  publishedAt: Date,
  tags: [String],
  externalLink: String
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
