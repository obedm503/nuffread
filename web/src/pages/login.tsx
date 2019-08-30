import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import { History } from 'history';
import { add, logIn } from 'ionicons/icons';
import * as React from 'react';
import { useApolloClient, useMutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { Email, IonButtonLink, Password, TopNav } from '../components';
import { IMutation, SystemUserType } from '../schema.gql';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: SystemUserType!) {
    login(email: $email, password: $password, type: $type)
  }
`;

const Errors = ({ errors }: { errors: readonly GraphQLError[] }) => (
  <>
    {errors.map(err => {
      let errMsg;
      switch (err.message) {
        case 'DUPLICATE_USER':
          errMsg = 'Email is already registered.';
          break;
        case 'NOT_CONFIRMED':
          errMsg = (
            <>
              Email is not yet confirmed. To confirm your email{' '}
              <Link to="/join/confirm">click here</Link>.
            </>
          );
          break;
        case 'WRONG_CREDENTIALS':
          errMsg = 'Wrong email or password.';
          break;
      }

      if (!errMsg) {
        return null;
      }

      return (
        <IonItem key={err.message}>
          <IonLabel color="danger">{errMsg}</IonLabel>
        </IonItem>
      );
    })}
  </>
);

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
      history.push('/');
    }
  };

  return (
    <Formik<{ email: string; password: string }>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={{ email: '', password: '' }}
    >
      {() => {
        if (loading) {
          return <div>Loading...</div>;
        }

        return (
          <Form>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <Email name="email" label="Email" />
                  <Password name="password" label="Password" />

                  {error ? <Errors errors={error.graphQLErrors} /> : null}
                </IonCol>
              </IonRow>

              <IonRow>
                {admin ? null : (
                  <IonCol>
                    <IonButtonLink
                      expand="block"
                      href="/join/signup"
                      color="secondary"
                    >
                      <IonIcon slot="start" icon={add} />
                      <IonLabel>Join</IonLabel>
                    </IonButtonLink>
                  </IonCol>
                )}

                <IonCol>
                  <input
                    type="submit"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      width: '1px',
                      height: '1px',
                    }}
                    tabIndex={-1}
                  />

                  <IonButton expand="block" color="primary" type="submit">
                    <IonIcon slot="start" icon={logIn} />
                    <IonLabel>Login</IonLabel>
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </Form>
        );
      }}
    </Formik>
  );
});

const adminSchema = yup.object().shape({
  email: yup
    .string()
    .required()
    .email(),
  password: yup.string().required(),
});
const userSchema = yup.object().shape({
  email: yup
    .string()
    .required()
    .email()
    .test(
      'edu',
      'Must be student email',
      value => !!value && value.endsWith('.edu'),
    ),
  password: yup.string().required(),
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
              <IonCol sizeMd="6" offsetMd="3">
                <IonCard>
                  <IonCardContent>
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
