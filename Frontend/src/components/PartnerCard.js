import React from 'react';
import { motion } from 'framer-motion';

export default function PartnerCard({ partner }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.3 }}
      className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition flex flex-col items-center text-center"
    >
      <img src={partner.image} alt={partner.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-amber-500 p-1" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/100x100?text=Logo';}}/>
      <h4 className="font-serif text-xl font-semibold">{partner.name}</h4>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 flex-1">{partner.description}</p>
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition"
      >
        Visit Website
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
      </a>
    </motion.div>
  );
}
