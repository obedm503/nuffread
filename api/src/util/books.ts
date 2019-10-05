import { Book, Listing } from '../entities';

export const books = [
  {
    authors: ['Peter Green'],
    isbn: ['9780520954694', '0520954696'],
    publishedAt: '2013-01-08T00:00:00.000Z',
    publisher: 'Univ of California Press',
    subTitle: 'A Historical Biography',
    title: 'Alexander of Macedon, 356–323 B.C.',
    thumbnail:
      'http://books.google.com/books/content?id=SYo6c1iEL_4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['Robert Darnley Raine'],
    isbn: ['1875950745', '9781875950744'],
    publishedAt: '2002-01-01T00:00:00.000Z',
    subTitle: 'Learning Guide',
    title: 'Repair Transmissions (Automatic) (aur07166a)',
  },
  {
    authors: ['N. Balakrishnan', 'William Chen'],
    isbn: ['0849331188', '9780849331183'],
    publishedAt: '1997-07-30T00:00:00.000Z',
    publisher: 'CRC Press',
    title:
      'CRC Handbook of Tables for Order Statistics from Inverse Gaussian Distributions with Applications',
    thumbnail:
      'http://books.google.com/books/content?id=Iy5f5vjfjfYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['J. R. R. Tolkien'],
    isbn: ['9786050465112', '6050465118'],
    publishedAt: '2016-06-25T00:00:00.000Z',
    title: 'The Hobbit',
    thumbnail:
      'http://books.google.com/books/content?id=j2uGDAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['John Ronald Reuel Tolkien'],
    isbn: ['9780345339683', '0345339681'],
    publishedAt: '1982-01-01T00:00:00.000Z',
    title: 'The Hobbit, Or, There and Back Again',
    thumbnail:
      'http://books.google.com/books/content?id=hFfhrCWiLSMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['J.R.R. Tolkien'],
    isbn: ['9780547951973', '0547951973'],
    publishedAt: '2012-02-15T00:00:00.000Z',
    publisher: 'Houghton Mifflin Harcourt',
    title: 'The Hobbit',
    thumbnail:
      'http://books.google.com/books/content?id=pD6arNyKyi8C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['J. R. R. Tolkien'],
    isbn: ['0883657465', '9780883657461'],
    publishedAt: '1993-09-01T00:00:00.000Z',
    publisher: 'Galahad Books',
    title: 'The Hobbit',
    thumbnail:
      'http://books.google.com/books/content?id=oRyoPwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['Mark Atherton'],
    isbn: ['9781780762463', '1780762461'],
    publishedAt: '2012-11-27T00:00:00.000Z',
    publisher: 'I.B.Tauris',
    subTitle: 'JRR Tolkien and the Origins of the Hobbit',
    title: 'There and Back Again',
    thumbnail:
      'http://books.google.com/books/content?id=39uvMgwDEDgC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['John Ronald Reuel Tolkien'],
    isbn: ['0008264228', '9780008264222'],
    publishedAt: '2017-01-01T00:00:00.000Z',
    subTitle: 'The Lord of the Rings',
    title: 'The Hobbit',
  },
  {
    authors: ['Jude Fisher'],
    isbn: ['9780547899329', '0547899327'],
    publishedAt: '2012-11-06T00:00:00.000Z',
    publisher: 'Houghton Mifflin Harcourt',
    title: 'The Hobbit: An Unexpected Journey Visual Companion',
    thumbnail:
      'http://books.google.com/books/content?id=F_i5Jdg8kYsC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['J. R. R. TOLKIEN'],
    isbn: ['0345340426', '9780345340429'],
    publishedAt: '1990-04-30T00:00:00.000Z',
    subTitle: 'THE HOBBIT AND THE COMPLETE LORD OF THE RINGS',
    title: 'J.R.R. TOLKIEN - BOXED SET',
    thumbnail:
      'http://books.google.com/books/content?id=XRF1RAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['Adam Roberts'],
    isbn: ['9781137373649', '1137373644'],
    publishedAt: '2013-11-01T00:00:00.000Z',
    publisher: 'Palgrave Macmillan',
    title: 'The Riddles of The Hobbit',
    thumbnail:
      'http://books.google.com/books/content?id=8KdEAgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['Jim Ware'],
    isbn: ['1414305966', '9781414305967'],
    publishedAt: '2006-01-01T00:00:00.000Z',
    publisher: 'Tyndale House Publishers, Inc.',
    title: 'Finding God in the Hobbit',
    thumbnail:
      'http://books.google.com/books/content?id=N_0VhzQKIIAC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['John Ronald Reuel Tolkien'],
    isbn: ['0007488300', '9780007488308'],
    publishedAt: '2012-01-01T00:00:00.000Z',
    publisher: 'HarperCollins Publishers',
    subTitle: 'Being the First Part of the Lord of the Rings',
    title: 'The Fellowship of the Ring',
    thumbnail:
      'http://books.google.com/books/content?id=_FjrugAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['John Ronald Reuel Tolkien'],
    isbn: ['1594130078', '9781594130076'],
    publishedAt: '2003-01-01T00:00:00.000Z',
    subTitle: 'Being the First Part of The Lord of the Rings',
    title: 'The Fellowship of the Ring',
    thumbnail:
      'http://books.google.com/books/content?id=ZQFiPwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['John Ronald Reuel Tolkien'],
    isbn: ['0261102311', '9780261102316'],
    publishedAt: '1991-01-01T00:00:00.000Z',
    publisher: 'HarperCollins Publishers',
    subTitle: 'Being the First Part of the Lord of the Rings',
    title: 'The Fellowship of the Ring',
    thumbnail:
      'http://books.google.com/books/content?id=WXzJjgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['J.R.R. Tolkien'],
    isbn: ['9780547952017', '0547952015'],
    publishedAt: '2012-02-15T00:00:00.000Z',
    publisher: 'Houghton Mifflin Harcourt',
    subTitle: 'Being the First Part of The Lord of the Rings',
    title: 'The Fellowship of the Ring',
    thumbnail:
      'http://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['J.R.R. Tolkien'],
    isbn: ['9780547951942', '0547951949'],
    publishedAt: '2012-02-15T00:00:00.000Z',
    publisher: 'Houghton Mifflin Harcourt',
    subTitle: 'One Volume',
    title: 'The Lord of the Rings',
    thumbnail:
      'http://books.google.com/books/content?id=yl4dILkcqm4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['Martin Barker', 'Ernest Mathijs'],
    isbn: ['0820463965', '9780820463964'],
    publishedAt: '2008-01-01T00:00:00.000Z',
    publisher: 'Peter Lang',
    subTitle: "Tolkien's World Audiences",
    title: 'Watching the Lord of the Rings',
    thumbnail:
      'http://books.google.com/books/content?id=5XOL49zCAHEC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['J. R. R. Tolkien'],
    isbn: ['0618343997', '9780618343997'],
    publishedAt: '2003-01-01T00:00:00.000Z',
    publisher: 'Houghton Mifflin Harcourt',
    title: 'The Lord of the Rings',
    thumbnail:
      'http://books.google.com/books/content?id=geAU_jMC7UUC&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    authors: ['Ernest Mathijs'],
    isbn: ['1904764827', '9781904764823'],
    publishedAt: '2006-01-01T00:00:00.000Z',
    publisher: 'Wallflower Press',
    subTitle: 'Popular Culture in Global Context',
    title: 'The Lord of the Rings',
    thumbnail:
      'http://books.google.com/books/content?id=I8mxughWAOEC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['Paul Simpson'],
    isbn: ['1843532751', '9781843532750'],
    publishedAt: '2003-01-01T00:00:00.000Z',
    publisher: 'Rough Guides',
    title: 'The Rough Guide to the Lord of the Rings',
    thumbnail:
      'http://books.google.com/books/content?id=hper1VsSlTkC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    authors: ['Ernest Mathijs', 'Murray Pomerance'],
    isbn: ['9789042016828', '9042016825'],
    publishedAt: '2006-01-01T00:00:00.000Z',
    publisher: 'Rodopi',
    subTitle: "Essays on Peter Jackson's Lord of the Rings",
    title: 'From Hobbits to Hollywood',
    thumbnail:
      'http://books.google.com/books/content?id=TvsF3vxvEswC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
].map((b, i) =>
  Object.assign(b, {
    publishedAt: new Date(b.publishedAt),
  }),
);

export const saveBooks = con =>
  con.transaction(async manager => {
    const b = await Book.save(
      books.map(book => {
        return Book.create(book);
      }),
    );

    await Listing.save(
      b.map(book =>
        Listing.create({
          book,
          userId: '01183498-83c5-43c6-9179-4966938450a1',
          schoolId: 'f3560244-0fee-4b63-bb79-966a8c04a950',
          price: Math.floor(Math.random() * 80) * 100,
        }),
      ),
    );
  });
