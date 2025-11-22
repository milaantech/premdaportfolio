import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast(){
  return useContext(ToastContext);
}

export default function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, title, message, timeout = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2,8);
    setToasts(t => [...t, { id, type, title, message }]);
    if(timeout > 0){
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
      }, timeout);
    }
    return id;
  }, []);

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="fixed right-4 bottom-6 z-60 flex flex-col gap-3 items-end">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full p-3 rounded-lg shadow-lg border ${t.type === 'error' ? 'bg-rose-600 text-white' : t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900'} border-slate-200`}>
            <div className="font-semibold text-sm">{t.title}</div>
            <div className="text-xs mt-1">{t.message}</div>
            <button onClick={() => remove(t.id)} className="absolute top-1 right-2 text-sm opacity-80">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
