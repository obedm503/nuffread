import React from 'react';
import { ListingCard } from '../../../components';
import { IGoogleBook } from '../../../schema.gql';
import { IListingPreview } from '../../../util.types';

export type ListingState = {
  googleId: string;
  price: string;
  description: string;
  book: IGoogleBook;
  coverIndex: number;
};

export const PreviewListing = React.memo<ListingState>(function PreviewListing({
  price,
  description,
  book,
  coverIndex,
}) {
  const listingPreview: IListingPreview = {
    __typename: 'ListingPreview',
    book: { ...book, thumbnail: book.possibleCovers[coverIndex] },
    price: price === '' ? 0 : parseFloat(price) * 100,
    createdAt: new Date().toISOString(),
    description,
  };

  return <ListingCard listing={listingPreview} />;
});
