import { IonBadge, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { resolve } from 'path';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../../components/listing';
import { IListing } from '../../schema.gql';

export const ListingDetails: React.SFC<{
  listing: IListing;
  base: string;
}> = ({ listing, base }) => (
  <Listing priceColor="success" listing={listing}>
    <IonButtons>
      <IonButton>
        <Link to={resolve(base, 'details')}>
          <IonBadge color="info">More Details</IonBadge>
        </Link>
      </IonButton>

      <IonButton href="#">
        <IonIcon slot="icon-only" name="barcode" />
      </IonButton>
    </IonButtons>
  </Listing>
);
