import {
  Button,
  Container,
  Control,
  Field,
  Hero,
  HeroBody,
  Input,
} from 'bloomer';
import gql from 'graphql-tag';
import { debounce } from 'lodash';
import { resolve } from 'path';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error, Icon } from '../components';
import { BASIC_LISTING, SEARCH } from '../queries';
import { IsDesktop } from '../state/desktop';
import { ListingsMain } from './components/listings';

type SearchBarProps = { onSearch: any; searchValue: string };
class SearchBar extends React.PureComponent<SearchBarProps> {
  onSearch: any;
  onChange = e => {
    if (!this.onSearch) {
      this.onSearch = debounce(this.props.onSearch, 150);
    }
    this.onSearch && this.onSearch({ ...e });
  };

  render() {
    const { searchValue } = this.props;
    return (
      <Hero isSize="medium" isColor="light">
        <HeroBody style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <Container>
            <Field hasAddons style={{ width: '100%' }}>
              <Control hasIcons isExpanded>
                <Icon name="search" size="small" align="left" />
                <Input
                  placeholder="Find your book"
                  onChange={this.onChange}
                  defaultValue={searchValue}
                />
              </Control>
              <Control>
                <Button>Search</Button>
              </Control>
            </Field>
          </Container>
        </HeroBody>
      </Hero>
    );
  }
}

type ListingsProps = {
  isDesktop: boolean;
  listingId?: string;
  onClick;
  base: string;
};
const SearchListings = ({
  isDesktop,
  listingId,
  onClick,
  searchValue,
  base,
}: ListingsProps & { searchValue: string }) => {
  return (
    <Query<GQL.IQuery> query={SEARCH} variables={{ query: searchValue }}>
      {({ error, data }) => {
        if (error || !data || !data.search) {
          return <Error value={error} />;
        }

        return (
          <ListingsMain
            isDesktop={isDesktop}
            listingId={listingId}
            onClick={onClick}
            base={base}
            listings={data.search}
          />
        );
      }}
    </Query>
  );
};

export const TOP_LISTINGS = gql`
  ${BASIC_LISTING}

  query TopListings {
    top {
      ...BasicListing

      seller {
        id
        name
      }
    }
  }
`;

const TopListings = ({
  isDesktop,
  listingId,
  onClick,
  base,
}: ListingsProps) => (
  <Query<GQL.IQuery> query={TOP_LISTINGS}>
    {({ error, data }) => {
      if (error || !data || !data.top) {
        return <Error value={error} />;
      }
      return (
        <ListingsMain
          isDesktop={isDesktop}
          listingId={listingId}
          onClick={onClick}
          base={base}
          listings={data.top}
        />
      );
    }}
  </Query>
);

const setParam = (params: string, searchQuery: string) => {
  const query = new URLSearchParams(params);
  query.set('query', searchQuery);
  return query.toString();
};

type SearchProps = RouteComponentProps<{ listingId?: string }>;
export class Home extends React.Component<
  SearchProps,
  { searchValue: string; search: URLSearchParams }
> {
  onSearch = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const search = setParam(this.props.location.search, target.value);
    this.props.history.push({ pathname: this.props.match.url, search });
  };

  onListingClick = listingId => {
    const search = setParam(this.props.location.search, this.state.searchValue);
    this.props.history.push({
      pathname: resolve(this.props.match.url, '..', listingId),
      search,
    });
  };

  static getDerivedStateFromProps({ location }: SearchProps) {
    const search = new URLSearchParams(location.search);
    return {
      searchValue: search.get('query') || '',
      search,
    };
  }

  state = { searchValue: '', search: new URLSearchParams() };

  render() {
    const {
      match: { params, url },
    } = this.props;

    return (
      <>
        <SearchBar
          onSearch={this.onSearch}
          searchValue={this.state.searchValue}
        />
        <IsDesktop>
          {({ isDesktop }) =>
            this.state.search.has('query') ? (
              <SearchListings
                onClick={this.onListingClick}
                isDesktop={isDesktop}
                listingId={params.listingId}
                searchValue={this.state.searchValue}
                base={url}
              />
            ) : (
              <TopListings
                onClick={this.onListingClick}
                isDesktop={isDesktop}
                listingId={params.listingId}
                base={url}
              />
            )
          }
        </IsDesktop>
      </>
    );
  }
}
