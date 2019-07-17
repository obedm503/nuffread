import { IonContent } from '@ionic/react';
import { join } from 'path';
import * as React from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router';
import { Footer, IonRoutes } from '../../components';
import { Nav } from './components/nav';
import { SearchResults } from './components/search-results';
import { TopListings } from './components/top-listings';
import { ListingPage } from './listing';

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
    const routes: RouteProps[] = [
      {
        path: '/:listingId',
        exact: true,
        render: routeProps => {
          console.log('listing: ', routeProps.match.params.listingId);
          return (
            <ListingPage
              id={routeProps.match.params.listingId}
              props={{ base: this.props.base }}
            />
          );
        },
      },
      {
        path: '/',
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
    return <IonRoutes base={this.props.base} routes={routes} />;
  }
}

export default class Public extends React.Component<RouteComponentProps> {
  render() {
    const path = this.props.location.pathname;
    if (path === '/') {
      return <Redirect to="/listings" />;
    }

    return (
      <>
        {path === '/listings' ? <Nav base="/listings" /> : null}

        <IonContent>
          <SearchPage {...this.props} base="/listings" />
        </IonContent>

        <Footer />
      </>
    );
  }
}
