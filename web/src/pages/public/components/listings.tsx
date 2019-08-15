import { IonContent, IonItem, IonLabel, IonList } from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { Listing, LoadingListing } from '../../../components/listing';
import { SearchBar } from '../../../components/search-bar';
import { IListing } from '../../../schema.gql';

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
  <IonContent>
    <SearchBar onSearch={onSearch} searchValue={searchValue || ''} />
    <IonList lines="none">{children}</IonList>
  </IonContent>
);

export class Listings extends React.PureComponent<Props> {
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
            onClick={this.onClick(listing.id)}
            listing={listing}
          />
        );
      }),
    );
  }
}
