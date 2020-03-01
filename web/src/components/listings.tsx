import { IonItem, IonLabel } from '@ionic/react';
import * as React from 'react';
import { ListWrapper } from './list-wrapper';
import { IListing } from '../schema.gql';

type Props = {
  listings?: readonly IListing[];
  loading: boolean;
  onClick: (id: string) => void;
  title?: string;
  component: React.ComponentType<{
    onClick?: (id: string) => void;
    listing: IListing;
  }> & {
    loading: JSX.Element[];
  };
};

export class Listings extends React.PureComponent<Props> {
  render() {
    const {
      listings,
      loading,
      title,
      component: Listing,
      onClick: handleClick,
    } = this.props;

    if (loading) {
      return <ListWrapper title={title}>{Listing.loading}</ListWrapper>;
    }

    if (!Array.isArray(listings) || !listings.length) {
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
            <Listing key={listing.id} onClick={handleClick} listing={listing} />
          );
        })}
      </ListWrapper>
    );
  }
}
