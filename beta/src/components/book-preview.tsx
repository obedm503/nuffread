import Link from 'next/link';
import { memo } from 'react';
import { IBasicListingFragment } from '../queries';
import { conditionNames } from '../util';
import { RelativeDate } from './date';

export function BookPreviews({ children }) {
  return (
    <div className="m-6 flex flex-wrap items-end justify-center">
      {children}
    </div>
  );
}

export const BookPreview = memo<{ listing: IBasicListingFragment }>(
  ({ listing }) => {
    return (
      <Link href={`/b/${listing.book.id}`}>
        <a>
          <div className="flex-shrink-0 m-4 relative overflow-hidden rounded-lg w-40 shadow-sm hover:shadow-lg border-light border">
            <div className="relative bg-light">
              <img
                className="w-40"
                alt={`${listing.book.title} book cover`}
                src={listing.book.thumbnail || ''}
              />
            </div>

            <div className="px-3 pb-3 mt-3">
              <span className="block opacity-75 -mb-1 text-xs">
                <RelativeDate date={listing.createdAt} />
              </span>

              <div className="flex justify-between">
                <span className="block font-semibold text-xs">
                  {listing.condition ? conditionNames[listing.condition] : ''}
                </span>

                <span className="bg-primary rounded-full text-white text-xs font-semibold px-3 py-2 leading-none flex items-center">
                  ${(listing.price / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </a>
      </Link>
    );
  },
);
