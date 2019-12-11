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
import React, { FC, useCallback } from 'react';
import { Container, Error, Loading } from '../../components';
import {
  IInvite,
  IMutationResendConfirmEmailArgs,
  IMutationSendInviteArgs,
} from '../../schema.gql';
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
        button={!!onClick}
        disabled={loading}
        key={invite.email}
        onClick={onClick && (() => onClick(invite))}
      >
        <IonLabel>
          {invite.name} ({invite.email})
        </IonLabel>
        {!onClick ? null : loading ? (
          <IonSpinner slot="end" />
        ) : (
          <IonIcon slot="end" icon={send} />
        )}
      </IonItem>
    ))}
  </>
);

const RESEND_CONFIRMATION_EMAIL = gql`
  mutation ResendConfirmationEmail($email: String!) {
    resendConfirmEmail(email: $email)
  }
`;
const SignedUp: FC<{ invites: IInvite[]; refetch }> = ({
  invites,
  refetch,
}) => {
  const [resendConfirmation, { loading, error }] = useMutation<
    IMutationResendConfirmEmailArgs
  >(RESEND_CONFIRMATION_EMAIL);

  const onClick = useCallback(
    async invite => {
      await resendConfirmation({ variables: { email: invite.email } });
      await refetch();
    },
    [resendConfirmation, refetch],
  );

  if (error) {
    return <Error value={error} />;
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Signed Up</IonCardTitle>
      </IonCardHeader>

      <Invites invites={invites} loading={loading} onClick={onClick} />
    </IonCard>
  );
};

const Page = ({ children }) => (
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
  } = useQuery(INVITES);
  const [
    sendInvite,
    { loading: loadingEmail, error: errorEmail },
  ] = useMutation<IMutationSendInviteArgs>(SEND_INVITE);

  if (loadingInvites) {
    return (
      <Page>
        <Loading />
      </Page>
    );
  }
  if (errorInvites || errorEmail) {
    return <Error value={errorInvites || errorEmail} />;
  }
  const invites = data!.invites;
  const { notInvited, users } = groupBy(invites, invite =>
    invite.invitedAt ? 'users' : 'notInvited',
  );
  const { notSignedUp, signedUp } = groupBy(users, invite =>
    invite.user ? 'signedUp' : 'notSignedUp',
  );
  const { confirmed, notConfirmed } = groupBy(signedUp, invite =>
    invite.user?.confirmedAt ? 'confirmed' : 'notConfirmed',
  );

  return (
    <Page>
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
        />
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
        />
      </IonCard>

      <SignedUp invites={notConfirmed} refetch={refetch} />

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Confirmed Email</IonCardTitle>
        </IonCardHeader>

        <Invites invites={confirmed} />
      </IonCard>
    </Page>
  );
};
