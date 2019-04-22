import { IonBadge, IonItem, IonIcon } from '@ionic/react';
import { resolve } from 'path';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IListing } from '../../../../schema.gql';
import { Listing } from '../../components/listing';

export const ListingDetails: React.SFC<{
  listing: IListing;
  base: string;
}> = ({ listing, base }) => (
  <Listing priceColor="success" priceSize="large" listing={listing}>
    <div>
      <div>
        <Link to={resolve(base, 'details')}>
          <IonBadge color="info">More Details</IonBadge>
        </Link>
        <IonItem href="#">
          <IonIcon size="small" name="barcode" />
        </IonItem>
      </div>
    </div>
  </Listing>
);
