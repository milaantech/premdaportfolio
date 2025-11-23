import React from 'react';
import { motion } from 'framer-motion';
import BookCard from './BookCard';

export default function About(props){
  // Coerce explicit null to empty object so `author.*` reads are safe
  const author = (props && props.author) || {};
  const books = (props && props.books) || [];
  const stats = author.stats || [];
  const suggestedBooks = (Array.isArray(books) ? books : []).filter(b => b).slice(0, 4);
  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="font-serif text-3xl md:text-4xl mb-6 text-amber-600 dark:text-amber-500">Meet the Author: {author.name || 'Author'}</h2>
      <div className="flex flex-col md:flex-row gap-6 items-start">
  <img src={author.avatar || 'https://placehold.co/240x240?text=Avatar'} alt={`${author.name || 'Author'} portrait`} className="w-36 h-36 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full object-cover shadow-xl border-4 border-white dark:border-slate-800 flex-shrink-0" />
        <div>
          <p className="text-base md:text-lg italic text-slate-600 dark:text-slate-300 mb-3">{author.tagline}</p>
          <p className="mt-3 text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">{author.bio}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-slate-600 dark:text-slate-400">
            {author.social && Object.entries(author.social).map(([platform, url]) => (
              url ? (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-sm capitalize hover:text-amber-500 transition">
                  {platform}
                </a>
              ) : null
            ))}
          </div>
        </div>
      </div>

      <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-serif text-2xl mb-6">Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {stats.length > 0 ? stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: index * 0.08 }} viewport={{ once: true }} className="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          )) : (
            <div className="text-slate-500">No milestones yet. Use the Admin panel to add stats.</div>
          )}
        </div>
      </section>

      {suggestedBooks.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h3 className="font-serif text-2xl mb-6">Suggested Reads</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {suggestedBooks.map(b => (
              <div key={b.id || b._id} className="h-full">
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.main>
  );
}
