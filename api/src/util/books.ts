type GoogleBook = {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors?: string[];
    publisher: string;
    publishedDate?: string;
    description: string;
    industryIdentifiers?: Array<{
      type: 'ISBN_10' | 'ISBN_13' | 'OTHER';
      identifier: string;
    }>;
    readingModes: {
      text: boolean;
      image: boolean;
    };
    pageCount: number;
    printedPageCount: number;
    dimensions: {
      height: string;
      width: string;
      thickness: string;
    };
    printType: string;
    categories: string[];
    maturityRating: string;
    allowAnonLogging: boolean;
    contentVersion: string;
    imageLinks?: {
      smallThumbnail: string;
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      extraLarge: string;
    };
    language: string;
    previewLink: string;
    infoLink: string;
    canonicalVolumeLink: string;
  };
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: boolean;
  };
  accessInfo: {
    country: string;
    viewability: string;
    embeddable: true;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub: {
      isAvailable: boolean;
    };
    pdf: {
      isAvailable: boolean;
    };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: boolean;
  };
};

const formatBook = (book: GoogleBook): GQL.IBook | undefined => {
  if (!book.volumeInfo.industryIdentifiers || !book.volumeInfo.authors) {
    return;
  }
  try {
    const isbn = book.volumeInfo.industryIdentifiers
      .filter(iid => iid.type === 'ISBN_10' || iid.type === 'ISBN_13')
      .map(iid => iid.identifier);

    if (!isbn.length) {
      return;
    }

    return {
      __typename: 'Book',
      id: book.id,
      etag: book.etag,
      title: book.volumeInfo.title,
      subTitle: book.volumeInfo.subtitle,
      authors: book.volumeInfo.authors,
      isbn,
      publishedAt: book.volumeInfo.publishedDate
        ? new Date(book.volumeInfo.publishedDate)
        : null,
      publisher: book.volumeInfo.publisher,
      thumbnail: book.volumeInfo.imageLinks
        ? book.volumeInfo.imageLinks.thumbnail
        : null,
    };
  } catch (e) {
    console.error(e);
  }
};

export const getBook = async (
  googleId: string,
): Promise<GQL.IBook | undefined> => {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${googleId}`,
  );
  const json = await res.json();
  return formatBook(json);
};

export const searchBooks = async (query: string): Promise<Array<GQL.IBook>> => {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${query}`,
  );
  const json: {
    kind: string;
    totalItems: number;
    items: GoogleBook[];
  } = await res.json();
  return json.items.map(item => formatBook(item)!).filter(b => !!b);
};