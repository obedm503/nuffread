import { join } from 'path';
import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { SearchResults } from './components/search-results';
import { TopListings } from './components/top-listings';

const setParam = (params: string, searchQuery: string) => {
  const query = new URLSearchParams(params);
  query.set('query', searchQuery);
  return query.toString();
};

type SearchProps = RouteComponentProps;
export class Buy extends React.Component<
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
    const {
      location: { pathname },
    } = this.props;

    if (pathname === '/') {
      return <Redirect to="/listings" />;
    }

    return this.state.search.has('query') ? (
      <SearchResults
        onClick={this.onListingClick}
        searchValue={this.state.searchValue}
        onSearch={this.onSearch}
      />
    ) : (
      <TopListings onClick={this.onListingClick} onSearch={this.onSearch} />
    );
  }
}
