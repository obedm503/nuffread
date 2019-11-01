import { IonItem, IonLabel } from '@ionic/react';
import * as React from 'react';
import { ListWrapper } from '../../../components/list-wrapper';
import { IListing } from '../../../schema.gql';

type Props = {
  listings?: readonly IListing[];
  loading: boolean;
  onClick;
  title?: string;
  component: React.ComponentType<{ onClick; listing: IListing }> & {
    loading: JSX.Element[];
  };
};

export class Listings extends React.PureComponent<Props> {
  onClick = id => () => {
    this.props.onClick(id);
  };
  render() {
    const { listings, loading, title, component: Listing } = this.props;

    if (loading || !Array.isArray(listings)) {
      return <ListWrapper title={title}>{Listing.loading}</ListWrapper>;
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
        {listings.map(listing => {
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
        })}
      </ListWrapper>
    );
  }
}
