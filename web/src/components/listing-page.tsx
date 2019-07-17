import {
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonIcon,
  IonList,
  IonPage,
  IonRow,
  IonSlide,
  IonSlides,
} from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { IonBackButton, IonButtonLink, TopNav } from '.';
import { withListing } from '../containers/listing';
import { UserDetails } from '../pages/public/components/user-details';
import { Listing, LoadingListing } from './listing';
import { SafeImg } from './safe-img';

const Fab = () => (
  <IonFab vertical="bottom" horizontal="end" slot="fixed">
    <IonFabButton>
      <b>Buy</b>
    </IonFabButton>
  </IonFab>
);
const None = () => (
  <IonRow>
    <IonCol>
      <IonList lines="none">
        <LoadingListing />
      </IonList>
    </IonCol>
  </IonRow>
);

const Slides = ({ listing }) => (
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
);

export const ListingPage = withListing<{ base: string }>(
  ({ data: listing, loading, props: { base } }) => {
    return (
      <IonPage>
        <TopNav title={listing ? listing.title : ''}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={base} />
          </IonButtons>
        </TopNav>

        <IonContent>
          {listing ? <Fab /> : null}

          <IonGrid>
            {loading || !listing ? (
              <None />
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
                    <Slides listing={listing} />
                  </IonCol>
                </IonRow>
              </>
            )}
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  },
);
