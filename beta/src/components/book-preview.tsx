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

export const BookPreview = memo<{ listing: IBasicListingFragment }>(
  ({ listing }) => {
    return (
      <Link href={`/b/${listing.book.id}`}>
        <a className="md:p-3">
          <div className="overflow-hidden rounded-lg md:w-44 bg-white shadow-lg hover:scale-105 transition duration-200 ease-in-out">
            <div className="relative bg-light">
              <img
                className="w-full md:w-44"
                alt={`${listing.book.title} book cover`}
                src={listing.book.thumbnail || ''}
              />
            </div>

            <div className="px-3 pb-3 mt-3 space-y-3">
              <span className="block opacity-75 text-xs px-3">
                <RelativeDate date={listing.createdAt} />
              </span>

              {listing.condition ? (
                <span className="block font-semibold text-xs px-3">
                  {conditionNames[listing.condition]}
                </span>
              ) : null}

              <div className="flex justify-between">
                <span className="bg-primary rounded-full text-white text-xs font-semibold px-3 py-2 leading-none flex items-center">
                  ${(listing.price / 100).toFixed(2)}
                </span>

                <SaveListingButton
                  small
                  listingId={listing.id}
                  saved={listing.saved}
                />
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  },
);
