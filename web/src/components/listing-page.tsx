import {
  IonButtons,
  IonCard,
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
import { barcode } from 'ionicons/icons';
import { range } from 'lodash';
import * as React from 'react';
import { IonButtonLink, TopNav } from '.';
import { withListing } from '../containers/listing';
import { UserDetails } from '../pages/public/components/user-details';
import { IListing } from '../schema.gql';
import { GoBack } from './go-back';
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
    <IonCol size="12" sizeLg="10" offsetLg="1">
      <IonList lines="none">
        <LoadingListing />
      </IonList>
    </IonCol>
  </IonRow>
);

const Slides: React.FC<{ listing: IListing }> = ({ listing }) => (
  <IonSlides pager>
    {range(12).map(i => (
      <IonSlide key={i}>
        <SafeImg
          style={{ width: '100%', height: 'auto' }}
          src={listing.book.thumbnail || undefined}
          placeholder="/img/book.png"
          alt={`Slide number ${i + 1}`}
        />
      </IonSlide>
    ))}
  </IonSlides>
);

export const ListingPage = withListing<{ base: string }>(
  ({ data: listing, loading, base }) => {
    return (
      <IonPage>
        <TopNav title={listing ? listing.book.title : ''}>
          <IonButtons slot="start">
            <GoBack base={base} />
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
                  <IonCol size="12" sizeLg="10" offsetLg="1">
                    <Listing listing={listing}>
                      <IonButtons>
                        <IonButtonLink href="#">
                          <IonIcon slot="icon-only" icon={barcode} />
                        </IonButtonLink>
                      </IonButtons>
                    </Listing>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeLg="10" offsetLg="1">
                    <UserDetails listingId={listing.id} />
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeLg="10" offsetLg="1">
                    <IonCard>
                      <Slides listing={listing} />
                    </IonCard>
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
