import Link from 'next/link';
import { memo } from 'react';
import { IBasicListingFragment, IBookFragment } from '../queries';
import { conditionNames } from '../util';
import { RelativeDate } from './date';
import { SaveListingButton } from './save-listing-button';

export function BookPreviews({ children }) {
  return (
    <div className="p-6 md:p-0 flex flex-col md:flex-row md:flex-wrap md:items-stretch md:justify-center space-y-6 md:space-y-0">
      {children}
    </div>
  );
}

export function BookWrapper({ children }) {
  return <div className="md:w-64 md:p-3">{children}</div>;
}

export const Book = memo<{
  book: IBookFragment;
  listing?: IBasicListingFragment;
  isPreview?: boolean;
}>(({ listing, book, isPreview }) => {
  const preview = (
    <div className="h-full overflow-hidden rounded-lg bg-white shadow-lg hover:scale-105 transition duration-200 ease-in-out flex flex-col items-stretch justify-between">
      <div className="relative bg-light">
        <img
          className="w-full"
          alt={`${book.title} book cover`}
          src={book.thumbnail || ''}
        />
      </div>

      <div className="px-3 pb-3 leading-tight">
        <div className="my-2 space-y-1">
          <div className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {book.title}
          </div>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis text-sm">
            {book.authors.join(', ')}
          </div>

          {listing ? (
            <div className="flex justify-between text-xs">
              <div className="opacity-75">
                <RelativeDate date={listing.createdAt} />
              </div>

              {listing.condition ? (
                <div className="font-medium">
                  {conditionNames[listing.condition]}
                </div>
              ) : null}
            </div>
          ) : null}

          {isPreview && listing?.description ? (
            <div className="">{listing.description}</div>
          ) : null}
        </div>

        {listing ? (
          <div className="flex justify-between">
            <span className="bg-primary rounded-lg text-white text-xs font-medium p-2 leading-none flex items-center">
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
        ) : null}
      </div>
    </div>
  );
  return isPreview ? (
    preview
  ) : (
    <Link href={`/b/${book.id}`}>
      <a>{preview}</a>
    </Link>
  );
});
