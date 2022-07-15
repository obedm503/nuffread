import { cart, cartOutline, syncOutline } from 'ionicons/icons';
import { useCallback } from 'react';
import { useMutation } from '../apollo/client';
import { Icon } from './icon';
import {
  Get_Saved_ListingsDocument as SAVED_LISTINGS,
  Save_ListingDocument as SAVE_LISTING,
} from '../queries';
import { classes } from '../util';
import { useIsLoggedIn } from '../util/auth';

export function SaveListingButton({
  listingId,
  saved,
  small,
}: {
  listingId: string;
  saved?: boolean;
  small?: boolean;
}) {
  const isLoggedIn = useIsLoggedIn();
  const [save, res] = useMutation(SAVE_LISTING);
  const client = res.client;
  const cartIcon = saved ? cart : cartOutline;
  const icon = res.loading ? syncOutline : cartIcon;

  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const res = await save({
        variables: { listingId, saved: !saved },
      });
      if (!res.data) {
        return;
      }
      const updatedListing = res.data.saveListing;
      if (updatedListing.saved) {
        // tracker.event('SAVE_POST', { listingId: updatedListing.id });
      } else {
        // tracker.event('UNSAVE_POST', { listingId: updatedListing.id });
      }

      client.cache.updateQuery(
        { query: SAVED_LISTINGS, variables: { offset: 0 } },
        listingsData => {
          if (
            !(listingsData?.me?.__typename === 'User') ||
            !listingsData?.me?.saved
          ) {
            return;
          }

          let totalCount = listingsData.me.saved.totalCount;
          let listings = listingsData.me.saved.items;
          if (updatedListing.saved) {
            listings = [updatedListing, ...listings];
            totalCount += 1;
          } else {
            listings = listings.filter(item => item.id !== updatedListing.id);
            totalCount -= 1;
          }
          return {
            ...listingsData,
            me: {
              ...listingsData.me,
              saved: {
                ...listingsData.me.saved,
                totalCount,
                items: listings,
              },
            },
          };
        },
      );
    },
    [save, client.cache, listingId, saved],
  );

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={res.loading}
      className={classes(
        'outline-none focus:outline-none p-2 bg-white rounded-lg flex items-center border border-black disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        { 'hover:bg-black hover:text-white': !res.loading },
      )}
      onClick={onClick}
    >
      <Icon
        icon={icon}
        className={classes(small ? '' : 'mr-2', {
          'animate-spin': res.loading,
        })}
      />{' '}
      {small ? '' : saved ? 'Remove from cart' : 'Save to cart'}
    </button>
  );
}
