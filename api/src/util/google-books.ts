import { logger } from '.';
import { IGoogleBook } from '../schema.gql';

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
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
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

const getLargestImage = (book: GoogleBook): string | undefined => {
  const images = book.volumeInfo.imageLinks;
  if (!images) {
    return;
  }
  if (images.extraLarge) {
    return images.extraLarge;
  }
  if (images.large) {
    return images.large;
  }
  if (images.medium) {
    return images.medium;
  }
  if (images.small) {
    return images.small;
  }
  if (images.thumbnail) {
    return images.thumbnail;
  }
  return images.smallThumbnail;
};

const formatBook = (book: GoogleBook): IGoogleBook | undefined => {
  try {
    if (!book.volumeInfo.industryIdentifiers || !book.volumeInfo.authors) {
      return;
    }

    const isbn = book.volumeInfo.industryIdentifiers
      .filter(iid => iid.type === 'ISBN_10' || iid.type === 'ISBN_13')
      .map(iid => iid.identifier);

    if (!isbn.length) {
      return;
    }

    return {
      googleId: book.id,
      etag: book.etag,
      title: book.volumeInfo.title,
      subTitle: book.volumeInfo.subtitle,
      authors: book.volumeInfo.authors,
      isbn,
      publishedAt: book.volumeInfo.publishedDate
        ? new Date(book.volumeInfo.publishedDate)
        : undefined,
      // publisher: book.volumeInfo.publisher,
      thumbnail: getLargestImage(book),
    };
  } catch (e) {
    logger.error(e);
  }
};

export const getBook = async (
  googleId: string,
): Promise<IGoogleBook | undefined> => {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${googleId}`,
  );
  const book: GoogleBook = await res.json();
  return formatBook(book);
};

export const searchBooks = async (query: string): Promise<IGoogleBook[]> => {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?maxResults=20&q=${query}`,
  );
  const json: {
    kind: string;
    totalItems: number;
    items?: GoogleBook[];
  } = await res.json();
  if (!Array.isArray(json.items)) {
    return [];
  }
  return json.items.map(item => formatBook(item)!).filter(b => !!b);
};
