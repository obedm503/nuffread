import { useApolloClient, useMutation } from '@apollo/react-hooks';
import {
  IonCard,
  IonCardContent,
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
import { History } from 'history';
import { add, logIn } from 'ionicons/icons';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { object } from 'yup';
import {
  Email,
  IonButtonLink,
  IonSubmit,
  Password,
  TopNav,
} from '../components';
import { apolloFormErrors } from '../components/apollo-error';
import { IMutation, SystemUserType } from '../schema.gql';
import { tracker } from '../state/tracker';
import { emailSchema, passwordSchema } from '../util';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: SystemUserType!) {
    login(email: $email, password: $password, type: $type) {
      ... on User {
        id
      }
      ... on Admin {
        id
      }
    }
  }
`;

const Errors = apolloFormErrors({
  DUPLICATE_USER: 'Email is already registered.',
  NOT_CONFIRMED: (
    <>
      Email is not yet confirmed. To confirm your email{' '}
      <Link to="/join">click here</Link>.
    </>
  ),
  WRONG_CREDENTIALS: 'Wrong email or passphrase.',
});

const LoginForm = React.memo<{
  type: keyof typeof SystemUserType;
  history: History;
  schema;
  admin?: boolean;
}>(({ schema, admin, type, history }) => {
  const [mutate, { loading, error }] = useMutation<IMutation>(LOGIN);
  const client = useApolloClient();

  const onSubmit = async ({ email, password }) => {
    const res = await mutate({
      variables: { email, password, type },
    });
    if (res && res.data && res.data.login) {
      await client.resetStore();
      tracker.login(res.data.login.id);
      history.push('/');
    }
  };

  return (
    <Formik<{ email: string; password: string }>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={{ email: '', password: '' }}
    >
      <Form>
        <IonList>
          <Email name="email" label="Email" disabled={loading} />
          <Password name="password" label="Passphrase" disabled={loading} />

          <Errors error={error} />
        </IonList>

        <IonGrid>
          <IonRow>
            {admin ? null : (
              <IonCol>
                <IonButtonLink expand="block" href="/join" color="secondary">
                  <IonIcon slot="start" icon={add} />
                  <IonLabel>Join</IonLabel>
                </IonButtonLink>
              </IonCol>
            )}

            <IonCol>
              <IonSubmit expand="block" disabled={loading}>
                <IonIcon slot="start" icon={logIn} />
                <IonLabel>Login</IonLabel>
              </IonSubmit>
            </IonCol>
          </IonRow>
        </IonGrid>
      </Form>
    </Formik>
  );
});

const adminSchema = object().shape({
  email: emailSchema,
  password: passwordSchema,
});
const userSchema = object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export class UserLogin extends React.PureComponent<
  RouteComponentProps<{}> & { admin?: boolean }
> {
  render() {
    const { history, admin = false } = this.props;
    return (
      <>
        <TopNav />

        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol sizeMd="6" offsetMd="3" sizeLg="4" offsetLg="4">
                <IonCard>
                  <IonCardContent>
                    <IonCardTitle className="ion-text-center">
                      Login
                    </IonCardTitle>

                    <LoginForm
                      history={history}
                      type={admin ? 'ADMIN' : 'USER'}
                      schema={admin ? adminSchema : userSchema}
                      admin={admin}
                    />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </>
    );
  }
}

export class AdminLogin extends React.PureComponent<RouteComponentProps<{}>> {
  render() {
    return <UserLogin {...this.props} admin />;
  }
}
