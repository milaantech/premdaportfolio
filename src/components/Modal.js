import React from 'react';
import { motion } from 'framer-motion';

export default function Modal({ modal, setModal }) {
  const { isOpen, title, message, onConfirm } = modal;
  if (!isOpen) return null;

  const isConfirmation = !!onConfirm;

  function handleAction(confirmed) {
    setModal({ isOpen: false, title: '', message: '', onConfirm: null });
    if (confirmed && onConfirm) {
      onConfirm();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow-2xl max-w-sm w-full"
      >
        <h3 className="font-serif text-xl mb-3">{title}</h3>
        <p className="text-slate-700 dark:text-slate-300 mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          {isConfirmation && (
            <button
              onClick={() => handleAction(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-500 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => handleAction(true)}
            className={`px-4 py-2 rounded-md text-white font-medium text-sm transition ${isConfirmation ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-700'}`}
          >
            {isConfirmation ? 'Confirm' : 'OK'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
