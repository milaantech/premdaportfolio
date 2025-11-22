import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home({ books = [], author = {}, showAlert, BookCard, Newsletter, PublishersTechPartnersSection, TrustedSupportersSection, publishers, techPartners, supporters, blogs = [] }){
  const booksArr = Array.isArray(books) ? books : [];
  const sorted = [...booksArr].sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
  const featuredBook = sorted[0] || booksArr[0] || null;
  const featuredImage = featuredBook?.images?.[0] || 'https://placehold.co/800x1200?text=Book';

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-6 py-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h2 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="text-4xl md:text-5xl font-serif leading-tight">
            Hello{author?.name ? `, I'm ` : ''}<span className="text-amber-500">{author?.name || ''}</span>
          </motion.h2>
          <p className="mt-4 text-lg text-slate-700 dark:text-slate-300 max-w-xl">{author?.bio || ''}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/books" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-semibold shadow-lg transition">
              Explore Books
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Contact
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 w-full">
            {booksArr.slice(0,3).map((b, index)=> (
              <motion.div key={b?.id || index} whileHover={{scale:1.03}} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700">
                  <img src={b?.images?.[0] || 'https://placehold.co/400x600?text=Cover'} alt={b?.title || 'Cover'} className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/800x1200?text=Cover'}}/>
                </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.6, delay:0.2}} className="relative hidden md:block">
          <div className="rounded-2xl overflow-hidden shadow-2xl transition hover:shadow-amber-500/50">
            <img src={featuredImage} alt={`Featured: ${featuredBook?.title || ''}`} className="w-full h-56 md:h-[420px] lg:h-[520px] object-cover" onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/800x1200?text=Featured'}}/>
            <div className="p-6 bg-gradient-to-t from-slate-900/90 to-transparent absolute inset-0 flex flex-col justify-end text-white">
              <span className="text-xs uppercase font-medium tracking-wider text-amber-300 mb-1">Featured Release</span>
              <h3 className="font-serif text-3xl">{featuredBook?.title || ''}</h3>
              <p className="text-sm mt-1">{featuredBook?.subtitle || ''}</p>
              <div className="mt-4 flex gap-3">
                <Link to={`/book/${featuredBook?.id || ''}`} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition">View Details</Link>
                <button
                  className="px-4 py-2 border border-white/50 rounded-lg hover:bg-white/10 transition"
                  onClick={() => showAlert('Quick Preview', 'This feature allows users to view a snippet of the book. Implement a dedicated modal or separate page.')}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

          {/* Blog teaser */}
          {blogs && blogs.length > 0 && (
            <section className="mt-14 pt-12 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-serif text-2xl mb-6">From the Blog</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.slice(0,3).map(b => (
                  <div key={b._id || b.id}>
                    <Link to={`/blog/${b._id || b.id}`} className="block">
                      <img src={b.image || 'https://placehold.co/800x450?text=Blog'} alt={b.title} className="w-full h-44 object-cover rounded-lg mb-3" />
                      <h4 className="font-serif text-lg">{b.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{b.excerpt}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

      {/* Added Newsletter Section */}
      <Newsletter showAlert={showAlert} />

      <section className="mt-14 pt-12 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-serif text-2xl mb-6">Recent Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {booksArr.map(book => (
            <BookCard key={book?.id || book?._id} book={book} />
          ))}
        </div>
      </section>

  {/* RE-ADDED: Publishers & Tech Partners Section */}
  <PublishersTechPartnersSection publishers={publishers} techPartners={techPartners} />

  {/* RE-ADDED: Trusted Supporters Section */}
  <TrustedSupportersSection supporters={supporters} />

    </motion.main>
  );
}
