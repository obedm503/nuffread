import { join } from 'path';
import * as React from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router';
import { IonRoutes } from '../../components';
import { ListingPage } from './components/listing';
import { SearchResults } from './components/search-results';
import { TopListings } from './components/top-listings';

const setParam = (params: string, searchQuery: string) => {
  const query = new URLSearchParams(params);
  query.set('query', searchQuery);
  return query.toString();
};

const List = ({ search, onClick, searchValue, onSearch }) =>
  search.has('query') ? (
    <SearchResults
      onClick={onClick}
      searchValue={searchValue}
      onSearch={onSearch}
    />
  ) : (
    <TopListings onClick={onClick} onSearch={onSearch} />
  );

type SearchProps = RouteComponentProps;
export class Buy extends React.Component<
  RouteComponentProps & SearchProps,
  { searchValue: string; search: URLSearchParams }
> {
  navigate = ({ pathname, searchValue }) => {
    const search = searchValue
      ? setParam(this.props.location.search, searchValue)
      : undefined;
    this.props.history.push({
      pathname,
      search,
    });
  };
  onSearch = searchValue => {
    this.navigate({ pathname: this.props.location.pathname, searchValue });
  };

  onListingClick = id => {
    this.navigate({
      pathname: join('/listings', id),
      searchValue: this.state.searchValue,
    });
  };

  static getDerivedStateFromProps({ history }: SearchProps) {
    const search = new URLSearchParams(history.location.search);
    return {
      searchValue: search.get('query') || '',
      search,
    };
  }

  state = { searchValue: '', search: new URLSearchParams() };

  render() {
    if (this.props.location.pathname === '/') {
      return <Redirect to="/listings" />;
    }

    const routes: RouteProps[] = [
      {
        path: '/listings/:listingId',
        exact: true,
        render: routeProps => (
          <ListingPage id={routeProps.match.params.listingId} />
        ),
      },
      {
        path: '/listings',
        exact: true,
        render: () => (
          <List
            onClick={this.onListingClick}
            onSearch={this.onSearch}
            search={this.state.search}
            searchValue={this.state.searchValue}
          />
        ),
      },
    ];
    return <IonRoutes routes={routes} />;
  }
}
