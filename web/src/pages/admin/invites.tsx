import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
} from '@ionic/react';
import gql from 'graphql-tag';
import { send } from 'ionicons/icons';
import groupBy from 'lodash/groupBy';
import React, { FC } from 'react';
import { Container, Error, Loading } from '../../components';
import { IInvite, IMutationSendInviteArgs } from '../../schema.gql';
import { useMutation, useQuery } from '../../state/apollo';

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

const Invites: React.FC<{
  invites?: IInvite[];
  loading?: boolean;
  onClick?: (invite: IInvite) => any;
}> = ({ invites = [], loading = false, onClick }) => (
  <>
    {invites.map(invite => (
      <IonItem
        button
        disabled={loading}
        key={invite.email}
        onClick={onClick && (() => onClick(invite))}
      >
        <IonLabel>
          {invite.name} ({invite.email})
        </IonLabel>
        {loading ? (
          <IonSpinner slot="end"></IonSpinner>
        ) : (
          <IonIcon slot="end" icon={send}></IonIcon>
        )}
      </IonItem>
    ))}
  </>
);

const SignedUp: FC<{ invites: IInvite[]; refetch }> = ({
  invites,
  refetch,
}) => {
  const [sendConfirmation, { loading, error }] = useMutation<
    IMutationSendInviteArgs
  >(SEND_INVITE);

  if (error) {
    return <Error value={error}></Error>;
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Signed Up</IonCardTitle>
      </IonCardHeader>

      <Invites
        invites={invites}
        loading={loading}
        onClick={async invite => {
          await sendConfirmation({ variables: { email: invite.email } });
          await refetch();
        }}
      ></Invites>
    </IonCard>
  );
};

const Wrapper = ({ children }) => (
  <IonPage>
    <IonContent>
      <Container>{children}</Container>
    </IonContent>
  </IonPage>
);

export default () => {
  const {
    loading: loadingInvites,
    error: errorInvites,
    data,
    refetch,
  } = useQuery(INVITES, { pollInterval: 60000 });
  const [
    sendInvite,
    { loading: loadingEmail, error: errorEmail },
  ] = useMutation<IMutationSendInviteArgs>(SEND_INVITE);

  if (loadingInvites) {
    return (
      <Wrapper>
        <Loading></Loading>
      </Wrapper>
    );
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
    <Wrapper>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Requested</IonCardTitle>
        </IonCardHeader>

        <Invites
          invites={notInvited}
          loading={loadingEmail}
          onClick={async invite => {
            await sendInvite({ variables: { email: invite.email } });
            await refetch();
          }}
        ></Invites>
      </IonCard>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Invited</IonCardTitle>
        </IonCardHeader>

        <Invites
          invites={notSignedUp}
          loading={loadingEmail}
          onClick={async invite => {
            await sendInvite({ variables: { email: invite.email } });
            await refetch();
          }}
        ></Invites>
      </IonCard>

      <SignedUp invites={notConfirmed} refetch={refetch}></SignedUp>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Confirmed Email</IonCardTitle>
        </IonCardHeader>

        <Invites invites={confirmed}></Invites>
      </IonCard>
    </Wrapper>
  );
};
