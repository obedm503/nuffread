import {
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  IonSlide,
  IonSlides,
} from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { IonBackButton, IonButtonLink, TopNav } from '../../components';
import { Listing, LoadingListing } from '../../components/listing';
import { SafeImg } from '../../components/safe-img';
import { withListing } from '../../containers/listing';
import { UserDetails } from './components/user-details';

export const ListingPage = withListing<{ base: string }>(
  ({ data: listing, loading, props: { base } }) => {
    return (
      <>
        <TopNav title={listing ? listing.title : ''}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={base} />
          </IonButtons>
        </TopNav>

        <IonContent>
          {listing ? (
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton>
                <b>Buy</b>
              </IonFabButton>
            </IonFab>
          ) : null}

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
                          <SafeImg
                            style={{ width: '100%', height: 'auto' }}
                            src={listing.thumbnail || undefined}
                            placeholder="/img/128x128.png"
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
        </IonContent>
      </>
    );
  },
);
