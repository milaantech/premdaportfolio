import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function MoreAuthorsSection({ authors = [] }) {
  return (
    <section className="mt-14 pt-12 border-t border-slate-200 dark:border-slate-700">
      <h3 className="font-serif text-2xl mb-6 text-amber-600 dark:text-amber-500">Discover More Authors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {authors.map((author, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <img src={author.avatar} alt={author.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-500" />
            <div>
              <div className="font-bold text-lg">{author.name}</div>
              <div className="text-sm text-slate-500">Author of "{author.book}"</div>
              <Link to="/contact" className="text-sm text-amber-600 dark:text-amber-400 mt-1 hover:underline inline-block">View Profile</Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
