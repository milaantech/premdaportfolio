import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Books({ books, showAlert, BookCard, Newsletter, MoreAuthorsSection }){
  const allGenres = ['All', ...new Set(books.map(b => b.genre).filter(g => g))];
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredBooks = activeFilter === 'All'
    ? books
    : books.filter(b => b.genre === activeFilter);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-6">
      <main className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="font-serif text-3xl mb-8 text-amber-600 dark:text-amber-500">Book Catalog</h2>

        {/* Category Filter Section */}
        <div className="mb-10 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-inner">
          <h3 className="font-medium text-sm mb-3">Filter by Genre:</h3>
          <div className="flex flex-wrap gap-2">
            {allGenres.map(genre => (
              <button
                key={genre}
                onClick={() => setActiveFilter(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeFilter === genre
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600'
                }`}
              >
                {genre} ({genre === 'All' ? books.length : books.filter(b => b.genre === genre).length})
              </button>
            ))}
          </div>
        </div>

        {/* Book Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.length > 0 ? (
            <AnimatePresence>
                {filteredBooks.map(b => (
          <motion.div key={b.id} className="h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <BookCard book={b} />
          </motion.div>
                ))}
            </AnimatePresence>
          ) : (
             <div className="lg:col-span-4 text-center py-10 text-slate-500">No books found in the selected genre: {activeFilter}</div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="mt-14">
            <Newsletter showAlert={showAlert} />
        </div>

        {/* More Authors Section (Kept for content density) */}
        <MoreAuthorsSection />

      </main>
    </motion.div>
  );
}
