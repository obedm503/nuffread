import {
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
} from '@ionic/react';
import * as React from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router';
import { Footer, IonBackButton, IonRoutes, TopNav } from '../../components';
import { Listing } from '../../components/listing';
import { SearchBar } from '../../components/search-bar';
import { IBook, IListing } from '../../schema.gql';
import { Nav } from './nav';

type IListings = Array<IListing | IBook>;
type Props = {
  id?: string;
  listings: IListings;
  onClick;
  base: string;
  component: (props: { id: string; base: string }) => React.ReactNode;
  onSearch;
  searchValue?: string;
};

const Detail: React.SFC<RouteComponentProps & Props> = ({
  component,
  id,
  base,
  listings,
}) => {
  if (!id) {
    return <Redirect to="/listings" />;
  }
  const listing = listings.find(item => item.id === id);
  if (!listing) {
    return <Redirect to="/listings" />;
  }
  return (
    <>
      <TopNav title={listing.title}>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/listings" />
        </IonButtons>
      </TopNav>

      <IonContent>{component({ id, base })}</IonContent>
    </>
  );
};

class List extends React.PureComponent<RouteComponentProps & Props> {
  onClick = id => () => this.props.onClick(id);
  render() {
    return (
      <>
        <Nav>
          <SearchBar
            onSearch={this.props.onSearch}
            searchValue={this.props.searchValue || ''}
          />
        </Nav>

        <IonContent>
          <IonList lines="none">
            {this.props.listings.length ? (
              <IonItem color="white">
                <IonLabel>Found nothing...</IonLabel>
              </IonItem>
            ) : (
              this.props.listings.map((listing, i) => {
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
              })
            )}
          </IonList>
        </IonContent>
        <Footer />
      </>
    );
  }
}

const routes: RouteProps[] = [
  {
    path: '/:listingId',
    exact: true,
    component: Detail,
  },
  {
    path: '/',
    exact: true,
    component: List,
  },
];
export class Listings extends React.PureComponent<Props> {
  render() {
    return <IonRoutes base="/listings" routes={routes} props={this.props} />;
  }
}
