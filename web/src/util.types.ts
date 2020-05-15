import { QueryLazyOptions } from '@apollo/react-hooks';
import { RefresherEventDetail } from '@ionic/core';
import { RouteProps } from 'react-router';
import { IGoogleBook, IListing, IPaginationInput } from './schema.gql';

export type RootPageProps = { globalRoutes: readonly RouteProps[] };

/** @param {T} T cannot of type boolean */
export type Optional<T> = T extends boolean ? unknown : T | false;

export type PaginatedRefresh<T> = {
  load: (options?: QueryLazyOptions<IPaginationInput>) => void;
  data?: T;
  loading: boolean;
  canFetchMore: boolean;
  fetchMore: (e: CustomEvent<void>) => Promise<void>;
  refresh: (event: CustomEvent<RefresherEventDetail>) => Promise<void>;
};

export type IListingPreview = Pick<
  IListing,
  'price' | 'createdAt' | 'description' | 'condition'
> & { book: IGoogleBook; __typename: 'ListingPreview' };
