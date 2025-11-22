import React from 'react';
import BookForm from './BookForm';

export default function BooksPanel({
  books,
  currency,
  toggleFeatured,
  setEditing,
  remove,
  form,
  setForm,
  addImage,
  handleImageChange,
  removeImage,
  save,
  editing,
  empty,
  previewImage,
  logoutAdmin,
  navigate,
  existingGenres
}){
  return (
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

      <BookForm
        form={form}
        setForm={setForm}
        addImage={addImage}
        handleImageChange={handleImageChange}
        removeImage={removeImage}
        save={save}
        editing={editing}
        setEditing={setEditing}
        empty={empty}
        previewImage={previewImage}
        logoutAdmin={logoutAdmin}
        navigate={navigate}
        existingGenres={existingGenres}
      />
    </div>
  );
}
