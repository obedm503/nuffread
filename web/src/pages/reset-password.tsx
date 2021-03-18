import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import { gql } from '@apollo/client';
import { key } from 'ionicons/icons';
import React from 'react';
import { Redirect, RouteComponentProps, RouteProps } from 'react-router';
import { object } from 'yup';
import {
  apolloFormErrors,
  Container,
  Email,
  Error,
  IonSubmit,
  Password,
  Routes,
  TopNav,
} from '../components';
import {
  IMutationRequestResetPasswordArgs,
  IMutationResetPasswordArgs,
} from '../schema.gql';
import { tracker, useMutation, useRouter, useUser } from '../state';
import { emailSchema, strongPasswordSchema } from '../util';

const Card = ({ children }) => (
  <IonCard color="white">
    <IonCardHeader>
      <IonCardTitle className="ion-text-center">Reset Passphrase</IonCardTitle>
    </IonCardHeader>

    <IonCardContent>{children}</IonCardContent>
  </IonCard>
);
const Submit = React.memo<{ loading: boolean }>(({ loading }) => (
  <IonGrid>
    <IonRow>
      <IonCol>
        <IonSubmit expand="block" disabled={loading}>
          <IonIcon slot="start" icon={key} />
          <IonLabel>Change Passphrase</IonLabel>
        </IonSubmit>
      </IonCol>
    </IonRow>
  </IonGrid>
));

const REQUEST_RESET = gql`
  mutation RequestResetPassword($email: String!) {
    requestResetPassword(email: $email)
  }
`;
const requestSchema = object().shape({ email: emailSchema });
const RequestResetForm: React.FC = () => {
  const [mutate, { loading, error, data }] = useMutation<
    IMutationRequestResetPasswordArgs
  >(REQUEST_RESET);

  const onSubmit = React.useCallback(
    async ({ email }) => {
      const res = await mutate({
        variables: { email },
      });
      if (res.data?.requestResetPassword) {
        tracker.event('REQUEST_RESET_PASSWORD', { email });
      }
    },
    [mutate],
  );

  if (error) {
    return <Error value={error} />;
  }

  if (data?.requestResetPassword) {
    return <p>Click the link in your email to reset your passphrase.</p>;
  }

  return (
    <Formik<{ email: string }>
      onSubmit={onSubmit}
      validationSchema={requestSchema}
      initialValues={{ email: '' }}
    >
      <Form>
        <IonList>
          <Email name="email" label="Email" disabled={loading} />
        </IonList>

        <Submit loading={loading} />
      </Form>
    </Formik>
  );
};

const RESET = gql`
  mutation resetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;
const resetSchema = object().shape({ password: strongPasswordSchema });
const ResetErrors = apolloFormErrors({
  WRONG_CREDENTIALS: 'An error occurred while trying to reset the passphrase',
});

const ResetForm: React.FC<{ token: string }> = ({ token }) => {
  const [mutate, { loading, error }] = useMutation<IMutationResetPasswordArgs>(
    RESET,
  );
  const { history } = useRouter();

  const onSubmit = React.useCallback(
    async ({ password }) => {
      const res = await mutate({
        variables: { password, token },
      });
      if (res?.data?.resetPassword) {
        tracker.event('RESET_PASSWORD', {});
        history.push('/login');
      }
    },
    [history, mutate, token],
  );

  return (
    <Formik<{ password: string }>
      onSubmit={onSubmit}
      validationSchema={resetSchema}
      initialValues={{ password: '' }}
    >
      <Form>
        <IonList>
          <Password name="password" label="New Passphrase" disabled={loading} />

          <ResetErrors error={error} />
        </IonList>

        <Submit loading={loading} />
      </Form>
    </Formik>
  );
};

const routes: RouteProps<string, { token: string }>[] = [
  {
    path: '/',
    exact: true,
    render: () => (
      <Card>
        <RequestResetForm />
      </Card>
    ),
  },
  {
    path: '/:token',
    render: ({ match }: RouteComponentProps<{ token: string }>) => (
      <Card>
        <ResetForm token={match.params.token} />
      </Card>
    ),
  },
];
export default React.memo<RouteComponentProps<{ token: string }>>(
  function ResetPassword({ match }) {
    const user = useUser();
    if (user) {
      return <Redirect to="/" />;
    }
    return (
      <IonPage>
        <TopNav homeHref="/" />

        <IonContent>
          <Container>
            <Routes routes={routes} base={match.url} />
          </Container>
        </IonContent>
      </IonPage>
    );
  },
);
