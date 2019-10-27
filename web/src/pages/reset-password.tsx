import { useMutation } from '@apollo/react-hooks';
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
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { key } from 'ionicons/icons';
import React, { FC, memo, useCallback } from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
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
import { IMutation } from '../schema.gql';
import { useRouter } from '../state/router';
import { tracker } from '../state/tracker';
import { emailSchema, strongPasswordSchema } from '../util';

const Card = ({ children }) => (
  <IonCard color="white">
    <IonCardHeader>
      <IonCardTitle className="ion-text-center">Reset Passphrase</IonCardTitle>
    </IonCardHeader>

    <IonCardContent>{children}</IonCardContent>
  </IonCard>
);
const Submit = memo<{ loading: boolean }>(({ loading }) => (
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
const RequestResetForm: FC = () => {
  const [mutate, { loading, error, data }] = useMutation<IMutation>(
    REQUEST_RESET,
  );

  const onSubmit = useCallback(
    async ({ email }) => {
      const res = await mutate({
        variables: { email },
      });
      if (res && res.data && res.data.requestResetPassword) {
        tracker.event('REQUEST_RESET_PASSWORD', { email });
      }
    },
    [mutate],
  );

  if (error) {
    return <Error value={error} />;
  }

  if (data && data.requestResetPassword) {
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

const ResetForm: FC<{ token: string }> = ({ token }) => {
  const [mutate, { loading, error }] = useMutation<IMutation>(RESET);
  const { history } = useRouter();

  const onSubmit = useCallback(
    async ({ password }) => {
      const res = await mutate({
        variables: { password, token },
      });
      if (res && res.data && res.data.resetPassword) {
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

const routes: RouteProps[] = [
  {
    path: '/:token',
    render: ({ match }: RouteComponentProps<{ token: string }>) => (
      <Card>
        <ResetForm token={match.params.token} />
      </Card>
    ),
  },
  {
    path: '/',
    exact: true,
    component: () => (
      <Card>
        <RequestResetForm />
      </Card>
    ),
  },
];
export default memo<RouteComponentProps<{ token: string }>>(({ match }) => (
  <>
    <TopNav />

    <IonContent>
      <Container>
        <Routes base={match.url} routes={routes} />
      </Container>
    </IonContent>
  </>
));
