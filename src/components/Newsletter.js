import React from 'react';
import { motion } from 'framer-motion';

export default function Newsletter({ showAlert }){
  function handleSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
        showAlert('Subscription Successful', `Thank you for subscribing, ${email}! You'll receive updates soon.`);
        e.target.reset();
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.3 }}
      className="mt-14 py-12 px-8 bg-amber-500 rounded-2xl shadow-xl text-white max-w-4xl mx-auto"
    >
      <div className="text-center">
        <h3 className="font-serif text-3xl font-bold mb-2">Join the Reader's Circle</h3>
        <p className="text-amber-100 mb-6">Get early access to cover reveals, event dates, and exclusive content.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            className="p-3 flex-1 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-slate-900 focus:border-slate-900 border-none"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-700 rounded-lg font-semibold transition shadow-md"
          >
            Subscribe
          </button>
        </form>
      </div>
    </motion.section>
  )
}
