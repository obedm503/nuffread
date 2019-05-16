import { IonBadge, IonButtons, IonIcon } from '@ionic/react';
import { resolve } from 'path';
import * as React from 'react';
import { IonButtonLink } from '../../components';
import { Listing } from '../../components/listing';
import { IListing } from '../../schema.gql';

export const ListingDetails: React.SFC<{
  listing: IListing;
  base: string;
}> = ({ listing, base }) => (
  <Listing priceColor="success" listing={listing}>
    <IonButtons>
      <IonButtonLink href={resolve(base, 'details')}>
        <IonBadge color="info">More Details</IonBadge>
      </IonButtonLink>

      <IonButtonLink href="#">
        <IonIcon slot="icon-only" name="barcode" />
      </IonButtonLink>
    </IonButtons>
  </Listing>
);
