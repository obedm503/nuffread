import { join } from 'path';
import React, { memo } from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { SearchResults } from '../pages/public/components/search-results';
import { TopListings } from '../pages/public/components/top-listings';
import { ListingPage } from './listing-page';
import { IonRoutes } from './routes';

const List = memo<{ onClick; searchValue: string; onSearch }>(
  ({ onClick, searchValue, onSearch }) => {
    return searchValue ? (
      <SearchResults
        onClick={onClick}
        searchValue={searchValue}
        onSearch={onSearch}
      />
    ) : (
      <TopListings onClick={onClick} onSearch={onSearch} />
    );
  },
);

type SearchProps = RouteComponentProps;
type SearchState = { searchValue: string; search: URLSearchParams };
export class SearchPage extends React.PureComponent<SearchProps, SearchState> {
  onSearch = searchValue => {
    let search: string | undefined;
    if (searchValue) {
      const query = new URLSearchParams(this.props.location.search);
      query.set('query', searchValue);
      search = query.toString();
    }
    this.props.history.push({
      pathname: this.props.location.pathname,
      search,
    });
  };
  onListingClick = id => {
    this.props.history.push({
      pathname: join(this.props.match.url, id),
      search: this.state.search.toString(),
    });
  };
  static getDerivedStateFromProps(
    { history }: SearchProps,
    { searchValue: currentSearchValue }: SearchState,
  ) {
    const search = new URLSearchParams(history.location.search);
    const searchValue = search.get('query') || '';
    if (searchValue === currentSearchValue) {
      return null;
    }
    return {
      searchValue,
      search,
    };
  }

  master = () => {
    return (
      <List
        onClick={this.onListingClick}
        onSearch={this.onSearch}
        searchValue={this.state.searchValue}
      />
    );
  };
  detail = (routeProps: RouteComponentProps<{ listingId: string }>) => {
    return <ListingPage id={routeProps.match.params.listingId} base="/" />;
  };
  state = { searchValue: '', search: new URLSearchParams() };
  render() {
    const routes: RouteProps[] = [
      { path: '/:listingId', render: this.detail },
      { path: '/', exact: true, render: this.master },
    ];
    return <IonRoutes routes={routes} base={this.props.match.url} />;
  }
}
