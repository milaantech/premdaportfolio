import React from 'react';
import { motion } from 'framer-motion';

export default function TrustedSupportersSection({ supporters = [] }) {
  return (
    <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
      <div className="text-center mb-8">
        <h3 className="font-serif text-3xl mb-2 text-amber-600 dark:text-amber-500">Our Trusted Supporters</h3>
        <p className="text-slate-600 dark:text-slate-400">Collaborating with the best in the literary and cultural space.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {supporters.map((supporter, index) => (
          <motion.a
            key={index}
            href={supporter.website}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.2)" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 group cursor-pointer transition"
          >
            <img
              src={supporter.logo}
              alt={supporter.name}
              title={supporter.name}
              className="h-12 w-auto filter grayscale opacity-70 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
              onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/150x50?text=Logo';}}
            />
            <div className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">{supporter.name}</div>
            <div className="text-xs text-amber-500">{supporter.category}</div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
