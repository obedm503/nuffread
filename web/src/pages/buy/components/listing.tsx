import {
  IonButtons,
  IonCol,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  IonSlide,
  IonSlides,
} from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { IonButtonLink } from '../../../components';
import { Listing, LoadingListing } from '../../../components/listing';
import { withListing } from '../../../containers/listing';
import { UserDetails } from './user-details';

export const ListingPage = withListing(({ data: listing, loading }) => {
  return (
    <IonGrid>
      {loading || !listing ? (
        <IonRow>
          <IonCol>
            <IonList lines="none">
              <LoadingListing />
            </IonList>
          </IonCol>
        </IonRow>
      ) : (
        <>
          <IonRow>
            <IonCol>
              <IonList lines="none">
                <Listing priceColor="success" listing={listing}>
                  <IonButtons>
                    <IonButtonLink href="#">
                      <IonIcon slot="icon-only" name="barcode" />
                    </IonButtonLink>
                  </IonButtons>
                </Listing>

                <UserDetails listingId={listing.id} />
              </IonList>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonSlides pager>
                {range(12).map(i => (
                  <IonSlide key={i}>
                    <img
                      style={{ width: '100%', height: 'auto' }}
                      src="/img/128x128.png"
                      alt=""
                    />
                  </IonSlide>
                ))}
              </IonSlides>
            </IonCol>
          </IonRow>
        </>
      )}
    </IonGrid>
  );
});
