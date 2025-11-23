export const SAMPLE_BOOKS = [
  {
    id: 'b1',
    title: 'The Quiet Library',
    subtitle: 'Stories from the attic',
    featured: true,
    price: 299,
    images: ['https://placehold.co/800x1200?text=Quiet+Library'],
    description: 'A warm collection of short stories about ordinary lives.',
    genre: 'Fiction',
    pages: 256,
    isbn: '978-1-23456-789-7',
    pubDate: '2023-06-12'
  },
];

export const SAMPLE_AUTHOR = {
  name: 'A. N. Author',
  tagline: 'Writing about small wonders',
  bio: 'A. N. Author writes tender stories and careful essays about everyday life. Their work focuses on observation, memory and the quiet moments in between.',
  avatar: 'https://placehold.co/240x240?text=Author',
  social: { instagram: '', goodreads: '', twitter: '' },
  stats: [ { label: 'Books Published', value: '3' }, { label: 'Awards', value: '1' } ]
};

export const SAMPLE_PUBLISHERS = [
  { id: 'p1', name: 'Milaan Publications House', logo: 'https://placehold.co/120x60?text=Maple' },
  { id: 'p2', name: 'Milaan Prakashan', logo: 'https://placehold.co/120x60?text=River' }
];

export const SAMPLE_TECH_PARTNERS = [
  { id: 't1', name: 'Milaan Technologies', logo: 'https://placehold.co/120x60?text=BookPay' }
];

export const SAMPLE_SUPPORTERS = [
  { id: 's1', name: 'Nearease', logo: 'https://placehold.co/120x60?text=Friends' }
];

export const SAMPLE_AUTHORS_COLLAB = [
  { name: 'S. Writer', avatar: 'https://placehold.co/160x160?text=S', book: 'Glass Birds' },
  { name: 'M. Poet', avatar: 'https://placehold.co/160x160?text=M', book: 'Night Songs' }
];

export const SAMPLE_REVIEWS = [
  { id: 'r1', user: 'ReaderOne', rating: 5, comment: 'Lovely book!', date: '2024-01-10' },
  { id: 'r2', user: 'ReaderTwo', rating: 4, comment: 'Great pace and voice.', date: '2024-03-03' }
];
