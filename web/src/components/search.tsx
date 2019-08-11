import { join } from 'path';
import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { SearchResults } from '../pages/public/components/search-results';
import { TopListings } from '../pages/public/components/top-listings';
import { ListingPage } from './listing-page';

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

type SearchProps = RouteComponentProps & { base: string };
export class SearchPage extends React.Component<
  SearchProps,
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
      pathname: join(this.props.base, id),
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
    return (
      <Switch>
        <Route
          path={join(this.props.base, '/:listingId')}
          exact
          render={routeProps => {
            const params = routeProps.match.params;
            return (
              <ListingPage
                id={params.listingId}
                props={{ base: this.props.base }}
              />
            );
          }}
        />
        <Route
          path={this.props.base}
          exact
          render={() => (
            <List
              onClick={this.onListingClick}
              onSearch={this.onSearch}
              search={this.state.search}
              searchValue={this.state.searchValue}
            />
          )}
        />
      </Switch>
    );
  }
}
