import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonPage,
} from '@ionic/react';
import * as React from 'react';
import { withListing } from '../containers/listing';
import { UserDetails } from '../pages/public/components/user-details';
import { Container } from './container';
import { ListingCard } from './listing-card';
import { TopNav } from './top-nav';

const Fab = () => (
  <IonFab vertical="bottom" horizontal="end" slot="fixed">
    <IonFabButton>
      <b>Buy</b>
    </IonFabButton>
  </IonFab>
);

// const Slides: React.FC<{ listing: IListing }> = ({ listing }) => (
//   <IonSlides pager>
//     {range(12).map(i => (
//       <IonSlide key={i}>
//         <SafeImg
//           style={{ width: '100%', height: 'auto' }}
//           src={listing.book.thumbnail || undefined}
//           placeholder="/img/book.png"
//           alt={`Slide number ${i + 1}`}
//         />
//       </IonSlide>
//     ))}
//   </IonSlides>
// );

export const ListingPage = withListing<{ base: string }>(
  ({ data: listing, loading, base }) => {
    return (
      <IonPage>
        <TopNav homeHref={false} title={listing ? listing.book.title : ''}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={base} />
          </IonButtons>
        </TopNav>

        <IonContent>
          {listing ? <Fab /> : null}

          <Container>
            {loading || !listing ? (
              ListingCard.loading[0]
            ) : (
              <>
                <ListingCard listing={listing} detailed></ListingCard>

                <UserDetails listingId={listing.id} />
              </>
            )}
          </Container>
        </IonContent>
      </IonPage>
    );
  },
);
