import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { BasicListing, BasicListingLoading } from '../../../components/listing';
import { IListing } from '../../../schema.gql';

type IListings = Array<IListing>;
type Props = {
  listings?: IListings;
  loading: boolean;
  onClick;
  title?: string;
};

const listingPlaceholders = range(10).map(n => <BasicListingLoading key={n} />);

const wrapper = (title, children) => (
  <IonList>
    {title ? (
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
      </IonListHeader>
    ) : null}

    {children}
  </IonList>
);

export class Listings extends React.PureComponent<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const { listings, loading, title } = this.props;

    if (loading || !Array.isArray(listings)) {
      return wrapper(title, listingPlaceholders);
    }

    if (!listings.length) {
      return wrapper(
        title,
        <IonItem color="white">
          <IonLabel>Found nothing...</IonLabel>
        </IonItem>,
      );
    }

    return wrapper(
      title,
      listings.map((listing, i) => {
        if (!listing) {
          return null;
        }
        return (
          <BasicListing
            key={listing.id}
            onClick={this.onClick(listing.id)}
            listing={listing}
          />
        );
      }),
    );
  }
}
