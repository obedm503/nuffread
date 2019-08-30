import { IonItem, IonLabel } from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { ListWrapper } from '../../../components/list-wrapper';
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

export class Listings extends React.PureComponent<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const { listings, loading, title } = this.props;

    if (loading || !Array.isArray(listings)) {
      return <ListWrapper title={title}>{listingPlaceholders}</ListWrapper>;
    }

    if (!listings.length) {
      return (
        <ListWrapper title={title}>
          <IonItem color="white">
            <IonLabel>Found nothing...</IonLabel>
          </IonItem>
        </ListWrapper>
      );
    }

    return (
      <ListWrapper title={title}>
        {listings.map((listing, i) => {
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
        })}
      </ListWrapper>
    );
  }
}
