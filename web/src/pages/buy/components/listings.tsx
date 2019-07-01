import { IonContent, IonItem, IonLabel, IonList } from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { Footer } from '../../../components';
import { Listing, LoadingListing } from '../../../components/listing';
import { SearchBar } from '../../../components/search-bar';
import { IListing } from '../../../schema.gql';
import { Nav } from './nav';

type IListings = Array<IListing>;
type Props = {
  listings?: IListings;
  loading: boolean;
  onClick;
  onSearch;
  searchValue?: string;
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

export class Listings extends React.Component<Props> {
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
