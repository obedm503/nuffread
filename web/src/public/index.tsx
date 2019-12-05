import { IonContent, IonPage } from '@ionic/react';
import React, { memo } from 'react';
import { Container } from '../components';
import { Nav } from './components/nav';

const Master = memo(function Master() {
  return (
    <IonPage>
      <Nav base="/" />

      <IonContent>
        <Container>public content goes here</Container>
      </IonContent>
    </IonPage>
  );
});

// const Detail = (routeProps: RouteComponentProps<{ listingId: string }>) => {
//   return <ListingPage id={routeProps.match.params.listingId} base="/" />;
// };

// export default memo(function Public() {
//   return (
//     <IonRouterOutlet>
//       <Route path="/" exact render={() => <Master />} />
//       <Route path="/:listingId" component={Detail} />
//     </IonRouterOutlet>
//   );
// });
export default Master;
