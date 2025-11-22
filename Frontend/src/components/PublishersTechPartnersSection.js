import React from 'react';
import PartnerCard from './PartnerCard';

export default function PublishersTechPartnersSection({ publishers = [], techPartners = [] }) {
  return (
    <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
      <h3 className="font-serif text-3xl mb-10 text-center text-amber-600 dark:text-amber-500">Publishing & Tech Partners</h3>

      <h4 className="font-serif text-2xl mb-6 text-slate-700 dark:text-slate-300 border-b pb-2 border-dashed">Publishing Houses</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {publishers.map((p, index) => (
          // Force publisher links to the bookstore URL per request
          <PartnerCard key={`pub-${index}`} partner={{ ...p, website: 'https://www.milaanpublications.in/bookstore' }} />
        ))}
      </div>

      <h4 className="font-serif text-2xl mt-12 mb-6 text-slate-700 dark:text-slate-300 border-b pb-2 border-dashed">Technology & Design Partners</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {techPartners.map((p, index) => (
          // Force tech partner links to the bookstore URL per request
          <PartnerCard key={`tech-${index}`} partner={{ ...p, website: 'https://www.milaanpublications.in/bookstore' }} />
        ))}
      </div>
    </section>
  );
}
