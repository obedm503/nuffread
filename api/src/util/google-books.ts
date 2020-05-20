import uniq from 'lodash/uniq';
import fetch from 'node-fetch';
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

export function processImageLink(urlString: string) {
  const url = new URL(urlString);
  url.protocol = 'https:';
  return url.toString();
}

function getImages(book: GoogleBook): string[] {
  const images = book.volumeInfo.imageLinks;
  if (!images) {
    return [];
  }
  return uniq(
    ([
      images.extraLarge,
      images.large,
      images.medium,
      images.small,
      images.thumbnail,
      images.smallThumbnail,
    ] as any[])
      .filter(link => typeof link === 'string' && !!link)
      .map(processImageLink),
  );
}

const formatBook = (book: GoogleBook): IGoogleBook | undefined => {
  try {
    if (
      !book.volumeInfo ||
      !book.volumeInfo.industryIdentifiers ||
      !book.volumeInfo.authors
    ) {
      return;
    }

    const isbn = book.volumeInfo.industryIdentifiers
      .filter(iid => iid.type === 'ISBN_10' || iid.type === 'ISBN_13')
      .map(iid => iid.identifier);

    if (!isbn.length) {
      return;
    }

    const possibleCovers = getImages(book);
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
      thumbnail: possibleCovers[0],
      possibleCovers,
    };
  } catch (e) {
    logger.error(e);
  }
};

export async function getBook(
  googleId: string,
): Promise<IGoogleBook | undefined> {
  const url = `https://www.googleapis.com/books/v1/volumes/${googleId}?key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const book: GoogleBook = await res.json();
  return formatBook(book);
}

export async function searchBooks(query: string): Promise<IGoogleBook[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?maxResults=20&q=${query}&key=${process.env.GOOGLE_API_KEY}`;
  const res = await fetch(url);
  const json: {
    kind: string;
    totalItems: number;
    items?: GoogleBook[];
  } = await res.json();
  if (!Array.isArray(json.items)) {
    return [];
  }
  return json.items.map(item => formatBook(item)!).filter(b => !!b);
}
