import React from 'react';

export default function BookForm({
  form,
  setForm,
  addImage,
  handleImageChange,
  removeImage,
  save,
  editing,
  setEditing,
  empty,
  previewImage,
  logoutAdmin,
  navigate,
  existingGenres
}){
  return (
    <aside className="p-6 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-lg h-fit md:sticky md:top-20">
      <h3 className="text-xl font-semibold mb-4">{editing? 'Edit Book' : 'Add New Book'}</h3>
      <div className="space-y-3">
        <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="p-3 border rounded-lg w-full dark:bg-slate-900" required />
        <input value={form.subtitle} onChange={e=>setForm({...form, subtitle:e.target.value})} placeholder="Subtitle" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
        <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price (₹)" className="p-3 border rounded-lg w-full dark:bg-slate-900" required />
        
        <input 
            value={form.genre} 
            onChange={e=>setForm({...form, genre:e.target.value})} 
            placeholder="Genre (e.g., Fiction, Poetry, Thriller)" 
            className="p-3 border rounded-lg w-full dark:bg-slate-900" 
            list="genre-suggestions"
            required
        />
        <datalist id="genre-suggestions">
            {existingGenres.map(genre => <option key={genre} value={genre} />)}
        </datalist>

        <input type="number" value={form.pages} onChange={e=>setForm({...form, pages:e.target.value})} placeholder="Pages" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
        <input value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})} placeholder="ISBN" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
        <input type="date" value={form.pubDate} onChange={e=>setForm({...form, pubDate:e.target.value})} placeholder="Publication Date" className="p-3 border rounded-lg w-full dark:bg-slate-900" />
        <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="p-3 border rounded-lg w-full h-32 dark:bg-slate-900" />

        <h4 className="pt-3 font-semibold text-sm text-slate-500 dark:text-slate-400">Book Images (First is Cover)</h4>
        <div className="space-y-3">
          {form.images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={image}
                onChange={e => handleImageChange(index, e.target.value)}
                placeholder={index === 0 ? "Primary Cover URL (Required)" : `Image URL ${index + 1}`}
                className="p-3 border rounded-lg w-full dark:bg-slate-900"
                required={index === 0}
              />
              <button
                onClick={() => removeImage(index)}
                className={`px-3 py-1 rounded-lg transition text-white ${index === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-700'}`}
                disabled={index === 0}
                type="button"
                title={index === 0 ? "Cannot remove primary cover" : "Remove Image"}
              >
                ✕
              </button>
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
  );
}
