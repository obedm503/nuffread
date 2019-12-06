import { IonBackButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import * as React from 'react';
import { Redirect } from 'react-router';
import {
  Container,
  IonButtonLink,
  ListingCard,
  ListingSeller,
  TopNav,
} from '../components';
import { useListing } from '../state/listing';

// const Fab = () => (
//   <IonFab vertical="bottom" horizontal="end" slot="fixed">
//     <IonFabButton>
//       <b>Buy</b>
//     </IonFabButton>
//   </IonFab>
// );

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

export const Listing = React.memo<{
  defaultHref: string;
  id: string;
}>(function Listing({ defaultHref, id }) {
  const { loading, listing } = useListing({ listingId: id });

  if (!loading && !listing) {
    return <Redirect to={defaultHref} />;
  }

  return (
    <IonPage>
      <TopNav homeHref={false} title="Post">
        <IonButtons slot="start">
          <IonBackButton defaultHref={defaultHref} />
        </IonButtons>

        {listing && listing.book.listings.totalCount > 1 ? (
          <IonButtons slot="end">
            <IonButtonLink href={listing ? `/b/${listing.book.id}` : ''}>
              More Deals
            </IonButtonLink>
          </IonButtons>
        ) : null}
      </TopNav>

      <IonContent>
        {/* {listing ? <Fab /> : null} */}

        <Container>
          {loading || !listing ? (
            ListingCard.loading[0]
          ) : (
            <>
              <ListingCard listing={listing} detailed></ListingCard>

              <ListingSeller listingId={listing.id} />
            </>
          )}
        </Container>
      </IonContent>
    </IonPage>
  );
});
