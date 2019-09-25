import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSpinner,
} from '@ionic/react';
import gql from 'graphql-tag';
import { send } from 'ionicons/icons';
import groupBy from 'lodash/groupBy';
import React from 'react';
import { Error, Loading } from '../../components';
import { IInvite, IMutation, IQuery } from '../../schema.gql';

const INVITES = gql`
  query GetInvites {
    invites {
      email
      name
      invitedAt
      user {
        id
        name
        photo
        confirmedAt
      }
    }
  }
`;
const SEND_INVITE = gql`
  mutation SendInvite($email: String!) {
    sendInvite(email: $email) {
      email
      name
      invitedAt
      user {
        id
        name
        photo
        confirmedAt
      }
    }
  }
`;

const Invites: React.FC<{ invites?: IInvite[] }> = ({ invites = [] }) => (
  <>
    {invites.map(invite => (
      <IonItem key={invite.email}>
        <IonLabel>{invite.email}</IonLabel>
      </IonItem>
    ))}
  </>
);

export default () => {
  const {
    loading: loadingInvites,
    error: errorInvites,
    data,
    refetch,
  } = useQuery<IQuery>(INVITES);
  const [sendEmail, { loading: loadingEmail, error: errorEmail }] = useMutation<
    IMutation
  >(SEND_INVITE);

  if (loadingInvites) {
    return <Loading></Loading>;
  }
  if (errorInvites || errorEmail) {
    return <Error value={errorInvites || errorEmail}></Error>;
  }
  const invites = data!.invites;
  const { notInvited, users } = groupBy(invites, invite =>
    invite.invitedAt ? 'users' : 'notInvited',
  );
  const { notSignedUp, signedUp } = groupBy(users, invite =>
    invite.user ? 'signedUp' : 'notSignedUp',
  );
  const { confirmed, notConfirmed } = groupBy(signedUp, invite =>
    invite.user && invite.user.confirmedAt ? 'confirmed' : 'notConfirmed',
  );

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeLg="10" offsetLg="1">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Requested</IonCardTitle>
                </IonCardHeader>

                {notInvited &&
                  notInvited.map(invite => (
                    <IonItem
                      button
                      disabled={loadingEmail}
                      key={invite.email}
                      onClick={async () => {
                        await sendEmail({ variables: { email: invite.email } });
                        await refetch();
                      }}
                    >
                      {loadingEmail ? (
                        <IonSpinner slot="end"></IonSpinner>
                      ) : (
                        <IonIcon slot="end" icon={send}></IonIcon>
                      )}
                      <IonLabel>{invite.email}</IonLabel>
                    </IonItem>
                  ))}
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Invited</IonCardTitle>
                </IonCardHeader>

                <Invites invites={notSignedUp}></Invites>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Signed Up</IonCardTitle>
                </IonCardHeader>

                <Invites invites={notConfirmed}></Invites>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Confirmed Email</IonCardTitle>
                </IonCardHeader>

                <Invites invites={confirmed}></Invites>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
