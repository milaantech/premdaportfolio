#!/usr/bin/env node
/**
 * Dedupe/generate slugs for Blog documents.
 *
 * Usage:
 *   MONGO_URI="mongodb://..." node scripts/dedupe-slugs.js
 *
 * What it does:
 * - Connects to MongoDB using process.env.MONGO_URI
 * - For any blog missing a slug, generates one from the title
 * - For duplicate slugs, appends -2, -3... until unique
 * - Updates documents in-place and prints a short summary
 *
 * IMPORTANT: Run this once before creating a unique index on `slug`.
 */

const mongoose = require('mongoose');
const Blog = require('../models/Blog');

function slugify(s=''){
  return s.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main(){
  const uri = process.env.MONGO_URI;
  if(!uri){
    console.error('MONGO_URI is not set. Set MONGO_URI environment variable and retry.');
    process.exit(2);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Load all blogs, but only the fields we need
  const blogs = await Blog.find({}).lean();
  console.log(`Loaded ${blogs.length} blog documents`);

  // Map to track used slugs
  const used = new Map();

  // First pass: ensure all have a slug (generate from title if missing)
  const updates = [];
  for(const b of blogs){
    let s = (b.slug || '').toString().trim();
    if(!s){
      s = slugify(b.title || `post-${b._id}`);
    } else {
      s = slugify(s);
    }
    // normalize empty result
    if(!s) s = `post-${b._id}`;

    // if slug already used, reserve a unique candidate later
    if(!used.has(s)){
      used.set(s, 1);
      if(s !== (b.slug || '')) updates.push({ id: b._id, slug: s });
    } else {
      // duplicate — will find a unique suffix
      const base = s;
      let i = used.get(base) + 1 || 2;
      let candidate = `${base}-${i}`;
      while(used.has(candidate)){
        i += 1;
        candidate = `${base}-${i}`;
        // safety cap
        if(i > 10000) break;
      }
      used.set(base, i);
      used.set(candidate, 1);
      updates.push({ id: b._id, slug: candidate });
    }
  }

  console.log(`Prepared ${updates.length} slug updates`);

  // Apply updates
  let applied = 0;
  for(const u of updates){
    try{
      await Blog.findByIdAndUpdate(u.id, { $set: { slug: u.slug } });
      applied += 1;
      console.log(`Updated ${u.id} -> ${u.slug}`);
    }catch(err){
      console.error(`Failed to update ${u.id}:`, err && err.message);
    }
  }

  console.log(`Applied ${applied}/${updates.length} updates`);
  console.log('Done. You may now create a unique index on `slug` if desired.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
