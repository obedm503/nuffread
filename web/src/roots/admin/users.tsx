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
  IonSpinner,
} from '@ionic/react';
import gql from 'graphql-tag';
import { send } from 'ionicons/icons';
import groupBy from 'lodash/groupBy';
import React, { FC, useCallback } from 'react';
import { Container, Error, Loading } from '../../components';
import { IMutationResendConfirmEmailArgs, IUser } from '../../schema.gql';
import { useMutation, useQuery } from '../../state';

const USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      confirmedAt
    }
  }
`;

const Users: React.FC<{
  users?: IUser[];
  loading?: boolean;
  onClick?: (user: IUser) => Promise<void>;
}> = ({ users = [], loading = false, onClick }) => (
  <IonCardContent>
    <IonList>
      {users.map(user => (
        <IonItem key={user.email}>
          <IonLabel class="ion-text-wrap">
            {user.name} ({user.email})
          </IonLabel>
          {!onClick ? null : (
            <IonButton
              slot="end"
              color="primary"
              disabled={loading}
              onClick={() => onClick(user)}
            >
              {loading ? (
                <IonSpinner slot="icon-only" />
              ) : (
                <IonIcon slot="icon-only" icon={send} />
              )}
            </IonButton>
          )}
        </IonItem>
      ))}
    </IonList>
  </IonCardContent>
);

const RESEND_CONFIRMATION_EMAIL = gql`
  mutation ResendConfirmationEmail($email: String!) {
    resendConfirmEmail(email: $email)
  }
`;
const SignedUp: FC<{ users: IUser[]; refetch }> = ({ users, refetch }) => {
  const [resendConfirmation, { loading, error }] = useMutation<
    IMutationResendConfirmEmailArgs
  >(RESEND_CONFIRMATION_EMAIL);

  const onClick = useCallback(
    async (user: IUser) => {
      await resendConfirmation({ variables: { email: user.email } });
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

      <Users users={users} loading={loading} onClick={onClick} />
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
  const { loading: loadingUsers, error: errorUsers, data, refetch } = useQuery(
    USERS,
  );

  if (loadingUsers) {
    return (
      <Page>
        <Loading />
      </Page>
    );
  }
  if (errorUsers) {
    return <Error value={errorUsers} />;
  }
  const users = data!.users;
  const { confirmed, notConfirmed } = groupBy(users, user =>
    user.confirmedAt ? 'confirmed' : 'notConfirmed',
  );

  return (
    <Page>
      <SignedUp users={notConfirmed} refetch={refetch} />

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Confirmed Email</IonCardTitle>
        </IonCardHeader>

        <Users users={confirmed} />
      </IonCard>
    </Page>
  );
};
