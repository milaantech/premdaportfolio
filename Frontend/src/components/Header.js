import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header(props){
  // If parent passes `author` as null (explicit), the destructuring default won't apply.
  // Coerce null -> {} here so downstream property accesses are safe.
  const author = (props && props.author) || {};
  const isAdmin = props && props.isAdmin;
  const featuredBook = props && props.featuredBook;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleBrandClick(e){
    setOpen(false);
    // Always navigate to homepage when the profile/brand is clicked
    navigate('/');
  }

  return (
    <header className="backdrop-blur bg-white/60 dark:bg-slate-900/60 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
  <button onClick={handleBrandClick} className="flex items-center gap-3" aria-label="Go to homepage">
          <img src={author.avatar} alt={`${author.name} avatar`} className="w-12 h-12 rounded-full object-cover shadow-sm" />
          <div>
            <h1 className="font-serif text-lg md:text-xl leading-none">{author.name}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">{author.tagline}</p>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-4" aria-label="Primary navigation">
          <NavLinks isAdmin={isAdmin} />
          {/* Profile avatar shortcut (desktop) */}
          <Link to="/about" className="ml-2" title="Author profile">
            <img src={author.avatar} alt={`${author.name} profile`} className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button aria-label="menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="md:hidden border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 py-4 flex flex-col gap-2">
              <NavLinks mobile isAdmin={isAdmin} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLinks({mobile, isAdmin}){
  const base = "text-sm font-medium";
  if(mobile) {
    return (
      <>
        <Link to="/books" className={`${base} block w-full px-4 py-3 rounded hover:bg-slate-100 dark:hover:bg-slate-700`}>Books</Link>
        <Link to="/blogs" className={`${base} block w-full px-4 py-3 rounded hover:bg-slate-100 dark:hover:bg-slate-700`}>Blog</Link>
        <Link to="/about" className={`${base} block w-full px-4 py-3 rounded hover:bg-slate-100 dark:hover:bg-slate-700`}>About</Link>
        <Link to="/contact" className={`${base} block w-full px-4 py-3 rounded hover:bg-slate-100 dark:hover:bg-slate-700`}>Contact</Link>
        {isAdmin ? (
          <Link to="/admin" className={`block w-full text-center px-4 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm transition`}>Admin</Link>
        ) : (
          <Link to="/admin/login" className={`block w-full text-center px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm transition hover:bg-slate-100 dark:hover:bg-slate-700`}>Login</Link>
        )}
      </>
    );
  }

  return (
    <>
      <Link to="/books" className={`${base} hover:underline`}>Books</Link>
      <Link to="/blogs" className={`${base} hover:underline`}>Blog</Link>
      <Link to="/about" className={`${base} hover:underline`}>About</Link>
      <Link to="/contact" className={`${base} hover:underline`}>Contact</Link>
      {isAdmin ? (
        <Link to="/admin" className={'px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm transition shadow'}>Admin</Link>
      ) : (
        <Link to="/admin/login" className={'px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm transition hover:bg-slate-100 dark:hover:bg-slate-700'}>Login</Link>
      )}
    </>
  );
}
