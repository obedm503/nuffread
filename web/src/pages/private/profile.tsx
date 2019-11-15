import { IonButtons, IonContent, IonPage } from '@ionic/react';
import * as React from 'react';
import { Container, LogoutItem, Popover, TopNav } from '../../components';
import { useUser } from '../../state/user';
import { UserInfo } from '../public/components/user-details';

export const Profile = () => {
  const user = useUser();

  if (!user || user.__typename !== 'User') {
    return null;
  }

  return (
    <IonPage>
      <TopNav homeHref="/home">
        <IonButtons slot="end">
          <Popover>
            <LogoutItem />
          </Popover>
        </IonButtons>
      </TopNav>

      <IonContent>
        <Container>
          <UserInfo user={user}></UserInfo>
        </Container>
      </IonContent>
    </IonPage>
  );
};
