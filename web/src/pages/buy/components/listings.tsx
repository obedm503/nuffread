import {
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router';
import { Footer, IonBackButton, IonRoutes, TopNav } from '../../../components';
import { Listing, LoadingListing } from '../../../components/listing';
import { SearchBar } from '../../../components/search-bar';
import { IBook, IListing } from '../../../schema.gql';
import { Nav } from './nav';

type IListings = Array<IListing | IBook>;
type Props = {
  listings?: IListings;
  loading: boolean;
  onClick;
  component: (props: { id: string }) => React.ReactNode;
  onSearch;
  searchValue?: string;
};

const Detail: React.SFC<
  RouteComponentProps<{ listingId?: string }> & Props
> = ({ component, listings, match: { params } }) => {
  const id = params.listingId;
  if (!id) {
    return <Redirect to="/listings" />;
  }

  const listing = listings && listings.find(item => item.id === id);

  return (
    <>
      <TopNav title={listing ? listing.title : ''}>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/listings" />
        </IonButtons>
      </TopNav>

      <IonContent>{component({ id })}</IonContent>
    </>
  );
};

const listingPlaceholders = range(10).map(n => <LoadingListing key={n} />);

const listingInner = ({ onSearch, searchValue }) => children => (
  <>
    <Nav>
      <SearchBar onSearch={onSearch} searchValue={searchValue || ''} />
    </Nav>

    <IonContent>
      <IonList lines="none">{children}</IonList>
    </IonContent>

    <Footer />
  </>
);

class List extends React.Component<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const inner = listingInner({
      onSearch: this.props.onSearch,
      searchValue: this.props.searchValue,
    });
    const { listings, loading } = this.props;

    if (loading || !Array.isArray(listings)) {
      return inner(listingPlaceholders);
    }

    if (!listings.length) {
      return inner(
        <IonItem color="white">
          <IonLabel>Found nothing...</IonLabel>
        </IonItem>,
      );
    }

    return inner(
      listings.map((listing, i) => {
        if (!listing) {
          return null;
        }
        return (
          <Listing
            key={listing.id}
            priceColor={i === 0 ? 'success' : undefined}
            onClick={this.onClick(listing.id)}
            listing={listing}
          />
        );
      }),
    );
  }
}

export class Listings extends React.Component<Props> {
  render() {
    const routes: RouteProps[] = [
      {
        path: '/:listingId',
        exact: true,
        render: routeProps => <Detail {...this.props} {...routeProps} />,
      },
      {
        path: '/',
        exact: true,
        render: () => <List {...this.props} />,
      },
    ];
    return <IonRoutes base="/listings" routes={routes} />;
  }
}
