import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
} from '@ionic/react';
import gql from 'graphql-tag';
import { trashOutline } from 'ionicons/icons';
import React from 'react';
import { Container, Error, Loading, RelativeDate } from '../../components';
import { useQuery } from '../../state/apollo';

const SESSIONS = gql`
  query GetSessions {
    sessions {
      id
      expiresAt
      user {
        ... on User {
          id
          name
          email
        }
        ... on Admin {
          id
          email
        }
      }
    }
  }
`;

const Page = ({ children }) => (
  <IonPage>
    <IonContent>
      <Container>{children}</Container>
    </IonContent>
  </IonPage>
);

export default () => {
  const { loading, error, data } = useQuery(SESSIONS);

  if (loading) {
    return (
      <Page>
        <Loading />
      </Page>
    );
  }
  if (error) {
    return <Error value={error} />;
  }
  const sessions = data!.sessions;

  return (
    <Page>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Active Users</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonList>
            {!sessions.length ? (
              <IonItem>
                <IonLabel>No items</IonLabel>
              </IonItem>
            ) : (
              sessions.map(({ id, user, expiresAt }) => (
                <IonItem key={id} lines="full">
                  <IonLabel className="ion-text-wrap">
                    <b>
                      {user.__typename === 'User' && user.name
                        ? `${user.name} ${user.email}`
                        : user.email}
                    </b>{' '}
                    <small>{id}</small>
                    <br />
                    Expires <RelativeDate date={expiresAt} />
                  </IonLabel>
                  <IonButton slot="end" color="primary">
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))
            )}
          </IonList>
        </IonCardContent>
      </IonCard>
    </Page>
  );
};
