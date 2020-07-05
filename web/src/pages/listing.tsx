import { IonBackButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import * as React from 'react';
import { Redirect } from 'react-router';
import {
  Container,
  IonButtonLink,
  ListingCard,
  ListingSeller,
  NavBar,
  useWillEnter,
} from '../components';
import { useListing } from '../state';
import { Optional } from '../util.types';

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
  defaultHref: Optional<string>;
  id: string;
}>(function Listing({ defaultHref, id }) {
  const { loading, listing, load } = useListing({ listingId: id });
  useWillEnter(load);

  if (!loading && !listing) {
    return <Redirect to={defaultHref === false ? '/' : defaultHref} />;
  }

  return (
    <IonPage>
      <NavBar
        title="Post"
        start={
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref || undefined} />
          </IonButtons>
        }
        end={
          <IonButtons slot="end">
            <IonButtonLink href={listing ? `/b/${listing.book.id}` : ''}>
              Deals
            </IonButtonLink>
          </IonButtons>
        }
      />

      <IonContent>
        {/* {listing ? <Fab /> : null} */}

        <Container>
          {loading || !listing ? (
            ListingCard.loading[0]
          ) : (
            <>
              <ListingCard listing={listing} detailed showUser={false} />

              <ListingSeller listingId={listing.id} />
            </>
          )}
        </Container>
      </IonContent>
    </IonPage>
  );
});
