import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';

export default function BlogList({ blogs = [] }){
  const posts = blogs || [];

  const featured = useMemo(() => posts[0] || null, [posts]);
  const rest = useMemo(() => posts.slice(1), [posts]);

  if(!posts.length) return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h3 className="font-serif text-3xl mb-4">Latest Posts</h3>
      <div className="text-slate-500">No blog posts yet.</div>
    </section>
  );

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="font-serif text-3xl mb-6">Latest Articles</h3>

          {featured && (
            <article className="mb-8 rounded-2xl overflow-hidden shadow-xl">
              <div className="relative">
                <img src={featured.image || 'https://placehold.co/1200x600?text=Featured'} alt={featured.title} className="w-full h-72 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute left-6 bottom-6 text-white">
                  <div className="text-sm uppercase tracking-widest text-amber-200">Featured</div>
                  <h2 className="font-serif text-3xl font-semibold">{featured.title}</h2>
                  <p className="mt-2 text-sm max-w-xl">{featured.excerpt}</p>
                  <div className="mt-4">
                    {/* Use react-router Link so HashRouter/SPA routing works correctly */}
                    <Link to={`/blog/${featured._id || featured.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg">Read Full Article</Link>
                  </div>
                </div>
              </div>
            </article>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.map(b => (<BlogCard key={b._id || b.id} blog={b} />))}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Search</h4>
              <input placeholder="Search articles" className="w-full p-2 border rounded-md dark:bg-slate-900" />
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
              <h4 className="font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(posts.flatMap(p => (Array.isArray(p.tags) ? p.tags : (p.tags ? String(p.tags).split(',') : []))))).slice(0,20).map((t,i)=> (
                  <button key={i} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">{t}</button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Thoughtful articles on books, publishing, and writing. Subscribe to our newsletter to get new posts delivered.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
