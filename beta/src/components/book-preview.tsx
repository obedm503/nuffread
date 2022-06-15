import Link from 'next/link';
import { memo } from 'react';
import { IBasicListingFragment } from '../queries';
import { conditionNames } from '../util';
import { RelativeDate } from './date';
import { SaveListingButton } from './save-listing-button';

export function BookPreviews({ children }) {
  return (
    <div className="p-6 md:p-0 flex flex-col md:flex-row md:flex-wrap md:items-end md:justify-center space-y-6 md:space-y-0">
      {children}
    </div>
  );
}

export const Book = memo<{
  listing: IBasicListingFragment;
  isPreview?: boolean;
}>(({ listing, isPreview }) => {
  const preview = (
    <div className="block overflow-hidden rounded-lg bg-white shadow-lg hover:scale-105 transition duration-200 ease-in-out">
      <div className="relative bg-light">
        <img
          className="w-full"
          alt={`${listing.book.title} book cover`}
          src={listing.book.thumbnail || ''}
        />
      </div>

      <div className="px-3 pb-3 mt-3 space-y-3">
        <div className="px-3 font-semibold leading-tight">
          {listing.book.title}
        </div>
        <div className="px-3 leading-tight">
          {listing.book.authors.join(', ')}
        </div>

        <span className="block opacity-75 text-xs px-3">
          <RelativeDate date={listing.createdAt} />
        </span>

        {listing.condition ? (
          <span className="block font-semibold text-xs px-3">
            {conditionNames[listing.condition]}
          </span>
        ) : null}

        {isPreview ? (
          <div className="px-3 leading-tight">{listing.description}</div>
        ) : null}

        <div className="flex justify-between">
          <span className="bg-primary rounded-full text-white text-xs font-semibold px-3 py-2 leading-none flex items-center">
            ${(listing.price / 100).toFixed(2)}
          </span>

          {isPreview ? null : (
            <SaveListingButton
              small
              listingId={listing.id}
              saved={listing.saved}
            />
          )}
        </div>
      </div>
    </div>
  );
  return isPreview ? (
    preview
  ) : (
    <Link href={`/b/${listing.book.id}`}>
      <a>{preview}</a>
    </Link>
  );
});
