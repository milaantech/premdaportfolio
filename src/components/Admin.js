import React, { useState, useEffect } from 'react';
import api, { API_BASE } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import OrdersAdmin from './OrdersAdmin';
import BooksPanel from './admin/BooksPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Admin({ books, setBooks, showAlert, logoutAdmin, author, setAuthor }){
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = React.useState(0);
  const [queuedCount, setQueuedCount] = React.useState(0);
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'about'
  const asideRef = React.createRef();

  const existingGenres = [...new Set(books.map(b => b.genre).filter(g => g))].sort();

  const empty = {
    title:'', subtitle:'', price:'',
    images: ['https://placehold.co/800x1200?text=New+Book+Cover'],
    description:'', genre:'', pages:0, isbn:'', pubDate: new Date().toISOString().slice(0, 10),
    amazonLink: '', flipkartLink: '', milaanLink: ''
  };
  const [form, setForm] = useState(empty);

  useEffect(()=>{
    if(editing) {
      setForm({...editing, images: editing.images || [empty.images[0]]});
    } else {
      setForm(empty);
    }
  }, [editing]);

  // Load order counts for badge
  async function loadOrderCounts(){
    try{
      const orders = await api.fetchOrders();
      setOrderCount(Array.isArray(orders) ? orders.length : 0);
    }catch(e){ setOrderCount(0); }
    try{
      const q = await api.fetchOrderQueue();
      setQueuedCount(Array.isArray(q) ? q.length : 0);
    }catch(e){ setQueuedCount(0); }
  }

  React.useEffect(()=>{ loadOrderCounts(); }, []);

  function handleImageChange(index, value) {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({...form, images: newImages });
  }

  function addImage() {
    setForm({...form, images: [...form.images, ''] });
  }

  function removeImage(index) {
    if (form.images.length === 1) {
      return showAlert('Error', 'A book must have at least one image (the primary cover).');
    }
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({...form, images: newImages });
  }

  function save(){
    const cleanedImages = form.images.filter(img => img && img.trim());

    if(!form.title || !form.price || !form.genre) return showAlert('Validation Error', 'Book Title, Price, and Genre are required.');
    if(cleanedImages.length === 0) return showAlert('Validation Error', 'At least one cover image URL is required.');

    const newBook = {
      ...form,
      images: cleanedImages,
      price: Number(form.price),
      pages: Number(form.pages)
    };

    // Persist to backend if available. Use either editing._id or editing.id for updates.
    (async () => {
      try{
        const editingId = editing && (editing._id || editing.id);
        if(editingId){
          await api.updateBook(editingId, newBook);
        } else {
          await api.createBook(newBook);
        }
        const remote = await api.fetchBooks();
        if(Array.isArray(remote)) setBooks(remote.map(b => ({ ...b, id: b._id || b.id })));
        setEditing(null);
        setForm(empty);
        showAlert('Saved', editingId ? 'Book updated successfully.' : 'Book created successfully.');
      }catch(err){
        // fallback to local behavior and surface an error
        showAlert('Save Failed', err.message || 'Failed to persist to server — saved locally as a fallback.');
        // If server says Unauthorized (expired/invalid JWT), force logout so user can re-login
        const msg = (err.message || '').toLowerCase();
        if(msg.includes('unauthorized') || msg.includes('jwt') || msg.includes('invalid token')){
          showAlert('Session Expired', 'Your admin session is invalid. Please log in again.');
          try{ logoutAdmin(navigate, true); }catch(e){}
        }
        if(editing){
          const idKey = editing.id || editing._id;
          setBooks(prev => prev.map(b => b.id === idKey ? {...newBook, id: idKey} : b));
          setEditing(null);
        }
        else {
          setBooks(prev => [{...newBook, id:`b${Date.now()}`}, ...prev]);
          setForm(empty);
        }
      }
    })();
  }

  function remove(id){
    showAlert('Confirm Deletion', 'Are you sure you want to delete this book? This action cannot be undone.', async () => {
      try{
  let token = null;
  try{ token = localStorage.getItem('pt_admin_token'); if(token) token = JSON.parse(token); }catch(e){ /* ignore */ }
  const headers = {};
  if(token) headers['Authorization'] = `Bearer ${token}`;
  // try server delete
  const res = await fetch(`${API_BASE}/api/books/${id}`, { method: 'DELETE', headers });
        if(!res.ok){
          const text = await res.text().catch(()=>res.statusText);
          throw new Error(text || 'Delete failed');
        }
        const remote = await fetch(`${API_BASE}/api/books`);
        const data = await remote.json();
        setBooks(data.map(b => ({ ...b, id: b._id || b.id })));
        showAlert('Deleted', 'Book deleted successfully.');
      }catch(err){
        // fallback local
        showAlert('Delete Failed', err.message || 'Failed to delete on server — deleted locally.');
        const msg = (err.message || '').toLowerCase();
        if(msg.includes('unauthorized') || msg.includes('jwt') || msg.includes('invalid token')){
          showAlert('Session Expired', 'Your admin session is invalid. Please log in again.');
          try{ logoutAdmin(navigate, true); }catch(e){}
          return;
        }
        setBooks(prev => prev.filter(b=>b.id!==id));
      }
    });
  }

  const previewImage = form.images?.[0] || 'https://placehold.co/400x600?text=Cover';

  // Mark a book as featured (only one book should be featured at a time)
  async function toggleFeatured(id) {
    // Try server-side toggle first, fallback to local update
    try{
      await api.toggleFeatured(id);
      // refresh list from server
      const remote = await api.fetchBooks();
      if(Array.isArray(remote)) setBooks(remote.map(b => ({ ...b, id: b._id || b.id })));
      showAlert('Updated', 'Featured book updated.');
    }catch(err){
      // fallback: optimistic local update
      setBooks(prev => {
        const clicked = prev.find(b => b.id === id);
        const makeFeatured = !(clicked && clicked.featured);
        const updated = prev.map(b => ({ ...b, featured: makeFeatured && b.id === id }));
        return updated;
      });
      const clicked = books.find(b => b.id === id);
      if (clicked && clicked.featured) showAlert('Updated', `${clicked.title} is no longer featured.`);
      else if (clicked) showAlert('Updated', `${clicked.title} is now the featured book.`);
    }
  }

  // --- About Page / Author editor state ---
  const emptyAuthorForm = {
    name: '',
    tagline: '',
    bio: '',
    avatar: '',
    social: { instagram: '', goodreads: '', twitter: '' },
    stats: []
  };

  const [authorForm, setAuthorForm] = useState(author || emptyAuthorForm);

  useEffect(() => {
    setAuthorForm(author || emptyAuthorForm);
  }, [author]);

  function handleSocialChange(key, value) {
    setAuthorForm(prev => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  function handleStatChange(index, field, value) {
    const newStats = [...(authorForm.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setAuthorForm(prev => ({ ...prev, stats: newStats }));
  }

  function addStat() {
    setAuthorForm(prev => ({ ...prev, stats: [ ...(prev.stats || []), { label: '', value: '' } ] }));
  }

  function removeStat(index) {
    setAuthorForm(prev => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  }

  function saveAuthor() {
    if (!authorForm.name || !authorForm.bio) return showAlert('Validation Error', 'Author Name and Bio are required.');
    const cleanedStats = (authorForm.stats || []).map(s => ({ label: (s.label||'').trim(), value: (s.value||'').toString().trim() })).filter(s => s.label || s.value);
    const newAuthor = { ...authorForm, stats: cleanedStats };
    // Try saving to backend, fall back to local state
    (async () => {
      try{
        const saved = await api.saveAuthor(newAuthor);
        if(saved) setAuthor(saved);
        else setAuthor(newAuthor);
        showAlert('Saved', 'About page content updated successfully.');
      }catch(err){
        setAuthor(newAuthor);
        showAlert('Saved (local)', 'Saved locally but failed to persist to server.');
      }
    })();
  }

  // --- Blogs admin state and helpers ---
  const [blogs, setBlogs] = useState([]);
  const [blogEditing, setBlogEditing] = useState(null);
  const blogEmpty = { title: '', slug: '', image: '', excerpt: '', content: '', published: true, publishedAt: new Date().toISOString().slice(0,10), tags: [], externalLink: '', author: (author && author.name) || '' };
  const [blogForm, setBlogForm] = useState(blogEmpty);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [blogUploading, setBlogUploading] = useState(false);

  function slugify(s=''){
    return s.toString().toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  useEffect(()=>{
    (async ()=>{
      try{ const remote = await api.fetchBlogs(); if(Array.isArray(remote)) setBlogs(remote.map(b=>({ ...b, id: b._id || b.id }))); }catch(e){}
    })();
  }, []);

  useEffect(()=>{ if(blogEditing) setBlogForm({...blogEditing}); else setBlogForm(blogEmpty); }, [blogEditing]);

  async function saveBlog(){
    if(!blogForm.title) return showAlert('Validation Error', 'Title is required');
    try{
      // ensure slug, tags array, and publishedAt are set correctly
      const payload = { ...blogForm };
      payload.slug = payload.slug || slugify(payload.title || '');
      if(typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map(t=>t.trim()).filter(Boolean);
      if(!payload.publishedAt) payload.publishedAt = new Date().toISOString();

      if(blogEditing && (blogEditing._id || blogEditing.id)){
        const id = blogEditing._id || blogEditing.id;
        await api.updateBlog(id, payload);
  const remote = await api.fetchBlogs(); if(Array.isArray(remote)) { setBlogs(remote.map(b=>({ ...b, id: b._id || b.id }))); window.dispatchEvent(new Event('blogs-updated')); }
        setBlogEditing(null); setBlogForm(blogEmpty);
        showAlert('Saved', 'Blog updated');
      } else {
        await api.createBlog(payload);
  const remote = await api.fetchBlogs(); if(Array.isArray(remote)) { setBlogs(remote.map(b=>({ ...b, id: b._id || b.id }))); window.dispatchEvent(new Event('blogs-updated')); }
        setBlogForm(blogEmpty);
        showAlert('Saved', 'Blog created');
      }
    }catch(err){
      showAlert('Save Failed', err.message || 'Failed to save blog');
    }
  }

  async function editBlog(blog){
    // fetch full blog from server in case list response is truncated
    try{
      const id = blog._id || blog.id;
      if(!id) return setBlogEditing(blog);
      const remote = await api.fetchBlog(id);
      // normalize tags to array for the form
      if(remote && remote.tags && !Array.isArray(remote.tags)){
        remote.tags = (remote.tags||'').toString().split(',').map(t=>t.trim()).filter(Boolean);
      }
      setBlogEditing(remote || blog);
    }catch(err){
      // fallback to using provided object
      setBlogEditing(blog);
      showAlert && showAlert('Load Failed', 'Could not load full blog details — using list data.');
    }
  }

  function removeBlogPrompt(blog){
    showAlert('Confirm Deletion', 'Delete this blog post? This cannot be undone.', async ()=>{
      try{
        const id = blog._id || blog.id;
        await api.deleteBlog(id);
        const remote = await api.fetchBlogs(); if(Array.isArray(remote)) setBlogs(remote.map(b=>({ ...b, id: b._id || b.id })));
        window.dispatchEvent(new Event('blogs-updated'));
        showAlert('Deleted', 'Blog deleted');
      }catch(err){
        showAlert('Delete Failed', err.message || 'Failed to delete blog');
      }
    });
  }

  // Handle image file input (convert to base64 data URL)
  function handleImageFile(e){
    const f = e.target.files && e.target.files[0];
    if(!f) return;

    // show an immediate local preview while uploading
    const localPreview = URL.createObjectURL(f);
    setBlogForm(prev => ({ ...prev, image: localPreview }));
    setBlogUploading(true);

    // upload to server endpoint /api/uploads
    (async () => {
  const fd = new FormData();
      fd.append('file', f);
      try{
        // include Authorization header if available
        const headers = {};
        try{ let token = localStorage.getItem('pt_admin_token'); if(token) token = JSON.parse(token); if(token) headers['Authorization'] = `Bearer ${token}`; }catch(e){}
        const res = await fetch(`${API_BASE}/api/uploads`, { method: 'POST', headers, body: fd });
        if(!res.ok){
          const text = await res.text().catch(()=>res.statusText);
          throw new Error(text || 'Upload failed');
        }
        const data = await res.json();
        if(data && data.url){
          // replace preview with server-hosted URL
          setBlogForm(prev => ({ ...prev, image: data.url }));
        } else {
          throw new Error('Invalid upload response');
        }
      }catch(err){
        // If upload fails, fall back to a base64 preview and notify the admin
        const reader = new FileReader();
        reader.onload = () => {
          setBlogForm(prev => ({ ...prev, image: reader.result }));
        };
        reader.readAsDataURL(f);
        try{ showAlert('Upload Failed', err.message || 'Image upload failed; using local preview.'); }catch(e){}
      } finally {
        setBlogUploading(false);
        // revoke the temporary object URL after a short delay to ensure the image element has loaded it
        setTimeout(()=>{ try{ URL.revokeObjectURL(localPreview); }catch(e){} }, 3000);
      }
    })();
  }

  // --- Simple URL validation for avatar and social links ---
  function isValidUrl(u){
    if(!u) return true; // allow empty
    try { const url = new URL(u); return url.protocol === 'http:' || url.protocol === 'https:'; } catch { return false; }
  }

  const avatarValid = isValidUrl(authorForm.avatar);
  const instagramValid = isValidUrl(authorForm.social?.instagram);
  const goodreadsValid = isValidUrl(authorForm.social?.goodreads);
  const twitterValid = isValidUrl(authorForm.social?.twitter);


  function currency(n){ return `₹${Number(n).toLocaleString('en-IN')}` }

  // Local subcomponent: BooksPanel
  function BooksPanel(){
    return (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-xl mb-4 font-semibold">Book List ({books.length})</h3>
          <div className="grid gap-3">
            {books.map(b=> (
              <div key={b.id} className="p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <div className="flex items-start gap-3">
                  <img src={b.images?.[0]} alt={b.title} className="w-16 h-24 object-cover rounded-md shadow-md flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600?text=Img' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base sm:text-lg truncate">{b.title}</div>
                    <div className="text-sm text-slate-500 truncate">{b.genre} • {currency(b.price)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      {b.amazonLink && <a href={b.amazonLink} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">Amazon</a>}
                      {b.flipkartLink && <a href={b.flipkartLink} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Flipkart</a>}
                      {b.milaanLink && <a href={b.milaanLink} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-slate-700 text-white rounded">Milaan</a>}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  {b.featured ? (
                    <button onClick={() => toggleFeatured(b.id)} title="Unfeature" className="px-3 py-1 rounded-lg bg-amber-500 text-white text-sm flex items-center gap-2">
                      <span>★</span>
                      <span className="hidden sm:inline">Featured</span>
                    </button>
                  ) : (
                    <button onClick={() => toggleFeatured(b.id)} title="Mark as featured" className="px-3 py-1 rounded-lg border border-amber-500 text-amber-600 hover:bg-amber-50 transition text-sm">Mark Featured</button>
                  )}
                  <button onClick={() => setEditing(b)} className="px-3 py-1 border border-amber-500 text-amber-600 dark:text-amber-500 rounded-lg hover:bg-amber-50 transition text-sm">Edit</button>
                  <button onClick={() => remove(b.id)} className="px-3 py-1 border border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50 transition text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside ref={asideRef} className="p-6 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-lg h-fit md:sticky md:top-20">
          <h3 className="text-xl font-semibold mb-4">{editing? 'Edit Book' : 'Add New Book'}</h3>
          <div className="space-y-3">
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="p-3 border rounded-lg w-full dark:bg-slate-900" required />
            <input value={form.subtitle} onChange={e=>setForm({...form, subtitle:e.target.value})} placeholder="Subtitle" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
            <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price (₹)" className="p-3 border rounded-lg w-full dark:bg-slate-900" required />
            <input value={form.genre} onChange={e=>setForm({...form, genre:e.target.value})} placeholder="Genre (e.g., Fiction, Poetry, Thriller)" className="p-3 border rounded-lg w-full dark:bg-slate-900" list="genre-suggestions" required />
            <datalist id="genre-suggestions">{existingGenres.map(genre => <option key={genre} value={genre} />)}</datalist>

            <input type="number" value={form.pages} onChange={e=>setForm({...form, pages:e.target.value})} placeholder="Pages" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
            <input value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})} placeholder="ISBN" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
            <input type="date" value={form.pubDate} onChange={e=>setForm({...form, pubDate:e.target.value})} placeholder="Publication Date" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="p-3 border rounded-lg w-full h-32 dark:bg-slate-900" />

            <h4 className="pt-3 font-semibold text-sm text-slate-500 dark:text-slate-400">Book Images (First is Cover)</h4>
            <div className="space-y-3">
              {form.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <input value={image} onChange={e => handleImageChange(index, e.target.value)} placeholder={index === 0 ? "Primary Cover URL (Required)" : `Image URL ${index + 1}`} className="p-3 border rounded-lg w-full dark:bg-slate-900" required={index === 0} />
                  <button onClick={() => removeImage(index)} className={`px-3 py-1 rounded-lg transition text-white ${index === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-700'}`} disabled={index === 0} type="button" title={index === 0 ? "Cannot remove primary cover" : "Remove Image"}>✕</button>
                </div>
              ))}
              <button onClick={addImage} className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition" type="button">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Add Image
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <input value={form.amazonLink || ''} onChange={e=>setForm({...form, amazonLink: e.target.value})} placeholder="Amazon link (optional)" className="p-2 border rounded w-full dark:bg-slate-900 text-sm" />
              <input value={form.flipkartLink || ''} onChange={e=>setForm({...form, flipkartLink: e.target.value})} placeholder="Flipkart link (optional)" className="p-2 border rounded w-full dark:bg-slate-900 text-sm" />
              <input value={form.milaanLink || ''} onChange={e=>setForm({...form, milaanLink: e.target.value})} placeholder="Milaan Publications link (optional)" className="p-2 border rounded w-full dark:bg-slate-900 text-sm" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button onClick={save} className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition">Save</button>
            <button onClick={()=>{ setEditing(null); setForm(empty); }} className="w-full sm:w-auto px-5 py-2 border border-slate-400 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">{editing ? 'Cancel Edit' : 'Clear Form'}</button>
          </div>

          {form.title && (
            <div className="mt-6 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
              <h5 className="font-semibold text-lg mb-3">Live Card Preview</h5>
              <div className="p-3 border border-slate-300 dark:border-slate-700 rounded-xl flex gap-4 items-center">
                <img src={previewImage} alt="preview" className="w-20 h-28 object-cover rounded-md shadow" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x600?text=Cover Not Found'; }} />
                <div>
                  <div className="font-bold text-lg">{form.title}</div>
                  <div className="text-sm text-slate-500">{form.genre} • {form.pages || '??'} pages</div>
                  <div className="mt-2 flex items-center gap-2">
                    {form.amazonLink && <a href={form.amazonLink} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-yellow-500 text-white rounded">Amazon</a>}
                    {form.flipkartLink && <a href={form.flipkartLink} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Flipkart</a>}
                    {form.milaanLink && <a href={form.milaanLink} target="_blank" rel="noreferrer" className="px-2 py-1 text-xs bg-slate-700 text-white rounded">Milaan</a>}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700">
             <button onClick={() => logoutAdmin(navigate)} className="w-full px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition shadow-md">Logout Admin</button>
          </div>
        </aside>
      </div>
      </>
    );
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl text-amber-600 dark:text-amber-500">Admin Dashboard</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveTab('books'); }} className={`px-4 py-2 rounded ${activeTab==='books' ? 'bg-amber-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'}`}>Books</button>
          <button onClick={() => { setActiveTab('about'); }} className={`px-4 py-2 rounded ${activeTab==='about' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'}`}>About Editor</button>
          <button onClick={() => { setActiveTab('blogs'); }} className={`px-4 py-2 rounded ${activeTab==='blogs' ? 'bg-pink-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'}`}>Blogs</button>
          <button onClick={() => { setActiveTab('orders'); loadOrderCounts(); }} className={`px-4 py-2 rounded ${activeTab==='orders' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'}`}>
            Orders
            {(orderCount > 0 || queuedCount > 0) && (
              <span className="ml-2 inline-flex items-center gap-1">
                {orderCount > 0 && <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-xs">{orderCount}</span>}
                {queuedCount > 0 && <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-xs">Q:{queuedCount}</span>}
              </span>
            )}
          </button>
          <button onClick={() => { setActiveTab('books'); setEditing(null); setForm && setForm(empty); setTimeout(()=>{ if(asideRef.current) asideRef.current.scrollIntoView({behavior:'smooth', block:'center'}); }, 100); }} className="px-4 py-2 rounded bg-slate-900 text-white">Add Book</button>
        </div>
      </div>
      
      {activeTab === 'books' && <BooksPanel />}

        {activeTab === 'orders' && (
          <div className="mt-4">
            <OrdersAdmin />
          </div>
        )}

      {activeTab === 'blogs' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
          <div className="lg:col-span-7">
            <h3 className="text-xl mb-4 font-semibold">Blog Posts ({blogs.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blogs.map(b => (
                <div key={b.id} className="p-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-stretch min-h-[12rem] box-border">
                  <div className="w-full sm:w-1/2 flex-shrink-0 flex items-center">
                    <img src={b.image || 'https://placehold.co/320x200?text=Blog'} alt={b.title} className="w-full h-44 sm:h-40 md:h-48 object-cover rounded-md shadow-sm" onError={(e)=>{e.target.onerror=null; e.target.src='https://placehold.co/320x200?text=Img'}} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="font-semibold text-lg leading-tight truncate break-words">{b.title}</div>
                      <div className="text-sm text-slate-500 mt-2" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{b.excerpt || ''}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className={`text-sm px-2 py-1 rounded ${b.published ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>{b.published ? 'Published' : 'Draft'}</div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => editBlog(b)} className="px-3 py-1 border border-amber-500 text-amber-600 rounded-lg text-sm">Edit</button>
                        <button onClick={() => removeBlogPrompt(b)} className="px-3 py-1 border border-rose-500 text-rose-500 rounded-lg text-sm">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="p-6 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-lg h-fit lg:col-span-3 lg:sticky lg:top-20 relative z-10 max-h-[calc(100vh-6rem)] overflow-auto">
            <h3 className="text-xl font-semibold mb-4">{blogEditing ? 'Edit Blog' : 'Add Blog'}</h3>
            <div className="space-y-3">
              <input value={blogForm.title} onChange={e=>setBlogForm({...blogForm, title:e.target.value, slug: slugify(e.target.value)})} placeholder="Title" className="p-3 border rounded-lg w-full dark:bg-slate-900" />

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-slate-100 rounded overflow-hidden border">
                    {blogForm.image ? <img src={blogForm.image} alt="featured" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No image</div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input type="file" accept="image/*" onChange={handleImageFile} className="text-sm text-slate-500" />
                      {blogUploading && (
                        <div className="text-xs text-amber-600 flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                          </svg>
                          <span>Uploading...</span>
                        </div>
                      )}
                    </div>
                    <input value={blogForm.image} onChange={e=>setBlogForm({...blogForm, image:e.target.value})} placeholder="Or image URL" className="mt-2 p-2 border rounded w-full dark:bg-slate-900 text-sm" />
                  </div>
                </div>
              </div>

              <textarea value={blogForm.excerpt} onChange={e=>setBlogForm({...blogForm, excerpt:e.target.value})} placeholder="Short description / excerpt" className="p-3 border rounded-lg w-full h-20 dark:bg-slate-900" />

              <input value={(Array.isArray(blogForm.tags) ? blogForm.tags.join(', ') : blogForm.tags||'')} onChange={e=>setBlogForm({...blogForm, tags: e.target.value})} placeholder="Tags (comma-separated)" className="p-2 border rounded w-full dark:bg-slate-900 text-sm" />

              <input value={blogForm.externalLink||''} onChange={e=>setBlogForm({...blogForm, externalLink:e.target.value})} placeholder="External / embed link (optional)" className="p-2 border rounded w-full dark:bg-slate-900 text-sm" />

              <div className="flex gap-2">
                <label className="text-sm">Publish Date</label>
                <input type="date" value={blogForm.publishedAt ? blogForm.publishedAt.slice(0,10) : new Date().toISOString().slice(0,10)} onChange={e=>setBlogForm({...blogForm, publishedAt: e.target.value})} className="p-2 border rounded ml-2" />
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Content</div>
                <ReactQuill theme="snow" value={blogForm.content || ''} onChange={val=>setBlogForm({...blogForm, content: val})} modules={{ toolbar: [[{ 'header': [1,2,3,false] }], ['bold','italic','underline','strike'], ['blockquote','code-block'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link','image'], ['clean'] ] }} formats={[ 'header','bold','italic','underline','strike','blockquote','code-block','list','bullet','link','image' ]} />
              </div>

              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!blogForm.published} onChange={e=>setBlogForm({...blogForm, published: e.target.checked})} /> Published</label>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveBlog} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">{blogEditing ? 'Update' : 'Save'}</button>
              <button onClick={()=>setPreviewOpen(true)} className="px-4 py-2 border rounded">Preview</button>
              {blogEditing && <button onClick={()=>removeBlogPrompt(blogEditing)} className="px-4 py-2 border border-rose-500 text-rose-600 rounded">Delete</button>}
              <button onClick={()=>{ setBlogEditing(null); setBlogForm(blogEmpty); }} className="px-4 py-2 border rounded">Cancel</button>
            </div>

            {previewOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="w-full max-w-3xl bg-white dark:bg-slate-800 p-6 rounded shadow-lg overflow-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Preview: {blogForm.title}</h3>
                    <button onClick={()=>setPreviewOpen(false)} className="px-3 py-1 border rounded">Close</button>
                  </div>
                  {blogForm.image && <img src={blogForm.image} alt="preview" className="w-full h-64 object-cover rounded mb-4" />}
                  <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blogForm.content || `<p>${blogForm.excerpt||''}</p>` }} />
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

  {/* About Page Editor (Admin) */}
  {activeTab === 'about' && (
    <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-serif text-2xl">About Page Editor</h3>
        <div className="flex items-center gap-2">
          <button onClick={saveAuthor} disabled={!avatarValid || !instagramValid || !goodreadsValid || !twitterValid || !authorForm.name || !authorForm.bio} className={`px-4 py-2 rounded ${(!avatarValid || !instagramValid || !goodreadsValid || !twitterValid || !authorForm.name || !authorForm.bio) ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}>Save</button>
          <button onClick={()=>setAuthorForm(author || emptyAuthorForm)} className="px-4 py-2 rounded border">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form column */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <input value={authorForm.name} onChange={e=>setAuthorForm({...authorForm, name:e.target.value})} placeholder="Author Name" className="p-3 border rounded-lg w-full dark:bg-slate-900" />

              <label className="text-sm font-medium mb-1 block mt-3">Tagline</label>
              <input value={authorForm.tagline} onChange={e=>setAuthorForm({...authorForm, tagline:e.target.value})} placeholder="Short tagline" className="p-3 border rounded-lg w-full dark:bg-slate-900" />

              <label className="text-sm font-medium mb-1 block mt-3">Avatar URL</label>
              <input value={authorForm.avatar} onChange={e=>setAuthorForm({...authorForm, avatar:e.target.value})} placeholder="https://..." className="p-3 border rounded-lg w-full dark:bg-slate-900" />
              {!avatarValid && <div className="text-rose-500 text-xs mt-1">Avatar must be a valid http(s) URL</div>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Short Bio</label>
              <textarea value={authorForm.bio} onChange={e=>setAuthorForm({...authorForm, bio:e.target.value})} placeholder="A short author bio" className="p-3 border rounded-lg w-full h-36 dark:bg-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Social Links</div>
              <input value={authorForm.social?.instagram || ''} onChange={e=>handleSocialChange('instagram', e.target.value)} placeholder="Instagram URL" className="p-2 border rounded-lg w-full dark:bg-slate-900 mb-2" />
              {!instagramValid && <div className="text-rose-500 text-xs mb-2">Must be a valid http(s) URL</div>}

              <input value={authorForm.social?.goodreads || ''} onChange={e=>handleSocialChange('goodreads', e.target.value)} placeholder="Goodreads URL" className="p-2 border rounded-lg w-full dark:bg-slate-900 mb-2" />
              {!goodreadsValid && <div className="text-rose-500 text-xs mb-2">Must be a valid http(s) URL</div>}

              <input value={authorForm.social?.twitter || ''} onChange={e=>handleSocialChange('twitter', e.target.value)} placeholder="Twitter URL" className="p-2 border rounded-lg w-full dark:bg-slate-900" />
              {!twitterValid && <div className="text-rose-500 text-xs mt-1">Must be a valid http(s) URL</div>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Milestones / Stats</div>
                <button onClick={addStat} type="button" className="px-2 py-1 bg-slate-900 text-white rounded text-sm">Add Stat</button>
              </div>
              <div className="space-y-2">
                {(authorForm.stats || []).map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input value={s.label} onChange={e=>handleStatChange(idx, 'label', e.target.value)} placeholder="Label (e.g., Books Published)" className="p-2 border rounded-lg w-1/2 dark:bg-slate-900" />
                    <input value={s.value} onChange={e=>handleStatChange(idx, 'value', e.target.value)} placeholder="Value (e.g., 7)" className="p-2 border rounded-lg w-1/3 dark:bg-slate-900" />
                    <button onClick={()=>removeStat(idx)} type="button" className="px-2 py-1 bg-rose-500 text-white rounded">✕</button>
                  </div>
                ))}
                {!(authorForm.stats || []).length && <div className="text-sm text-slate-500">No stats yet — click Add Stat to create one.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Preview column */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center text-center">
            <img src={authorForm.avatar || 'https://placehold.co/160x160?text=Avatar'} alt="preview avatar" className="w-28 h-28 rounded-full object-cover mb-3" onError={(e)=>{e.target.onerror=null; e.target.src='https://placehold.co/160x160?text=Avatar'}} />
            <div className="font-serif text-xl font-semibold">{authorForm.name || 'Author Name'}</div>
            <div className="text-sm text-slate-500">{authorForm.tagline || 'Tagline goes here'}</div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{authorForm.bio || 'Short bio preview will appear here as you type.'}</p>
            <div className="mt-3 flex gap-2">
              {authorForm.social?.instagram && <a href={authorForm.social.instagram} target="_blank" rel="noreferrer" className={`text-xs px-2 py-1 rounded ${instagramValid? 'bg-amber-500 text-white': 'bg-rose-200 text-rose-700'}`}>Instagram</a>}
              {authorForm.social?.goodreads && <a href={authorForm.social.goodreads} target="_blank" rel="noreferrer" className={`text-xs px-2 py-1 rounded ${goodreadsValid? 'bg-amber-500 text-white': 'bg-rose-200 text-rose-700'}`}>Goodreads</a>}
              {authorForm.social?.twitter && <a href={authorForm.social.twitter} target="_blank" rel="noreferrer" className={`text-xs px-2 py-1 rounded ${twitterValid? 'bg-amber-500 text-white': 'bg-rose-200 text-rose-700'}`}>Twitter</a>}
            </div>
            {authorForm.stats?.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                {authorForm.stats.map((s, i) => (
                  <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded text-center border">
                    <div className="text-2xl font-bold text-amber-500">{s.value || '—'}</div>
                    <div className="text-xs text-slate-500">{s.label || 'Stat'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

    </motion.main>
  );
}
