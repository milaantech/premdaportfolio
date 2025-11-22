exports.SAMPLE_BOOKS = [
  {
    title: 'The Quiet Library',
    subtitle: 'Stories from the attic',
    featured: true,
    price: 299,
    images: ['https://placehold.co/800x1200?text=Quiet+Library'],
    description: 'A warm collection of short stories about ordinary lives.',
    genre: 'Fiction',
    pages: 256,
    isbn: '978-1-23456-789-7',
    pubDate: new Date('2023-06-12')
  },
  {
    title: 'Poems in Motion',
    subtitle: 'Verses for the everyday',
    price: 199,
    images: ['https://placehold.co/800x1200?text=Poems+in+Motion'],
    description: 'A slim volume of observational poetry.',
    genre: 'Poetry',
    pages: 120,
    isbn: '978-1-23456-789-8',
    pubDate: new Date('2021-02-01')
  }
];

exports.SAMPLE_AUTHOR = {
  name: 'A. N. Author',
  tagline: 'Writing about small wonders',
  bio: 'A. N. Author writes tender stories and careful essays about everyday life. Their work focuses on observation, memory and the quiet moments in between.',
  avatar: 'https://placehold.co/240x240?text=Author',
  social: { instagram: '', goodreads: '', twitter: '' },
  stats: [ { label: 'Books Published', value: '3' }, { label: 'Awards', value: '1' } ]
};
