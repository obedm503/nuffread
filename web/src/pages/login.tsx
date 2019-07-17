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
import ApolloClient from 'apollo-client';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import * as React from 'react';
import { Mutation, MutationFn } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { Email, Footer, IonButtonLink, Password, TopNav } from '../components';
import { IMutation, SystemUserType } from '../schema.gql';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: SystemUserType!) {
    login(email: $email, password: $password, type: $type)
  }
`;

class LoginForm extends React.Component<{
  type: keyof typeof SystemUserType;
  history: History;
  schema;
  admin?: boolean;
}> {
  onSubmit = (
    mutate: MutationFn<IMutation>,
    client: ApolloClient<Object>,
  ) => async ({ email, password }) => {
    const res = await mutate({
      variables: { email, password, type: this.props.type },
    });
    if (res && res.data && res.data.login) {
      await client.resetStore();
      this.props.history.push('/');
    }
  };
  render() {
    const { schema, admin } = this.props;
    return (
      <Mutation<IMutation> mutation={LOGIN}>
        {(mutate, { loading, client, error }) => {
          return (
            <Formik<{ email: string; password: string }>
              onSubmit={this.onSubmit(mutate, client)}
              validationSchema={schema}
              initialValues={{ email: '', password: '' }}
            >
              {({ touched, errors }) => {
                if (loading) {
                  return <div>Loading...</div>;
                }

                return (
                  <Form>
                    <IonGrid>
                      <IonRow>
                        <IonCol>
                          <Email
                            name="email"
                            label="Email"
                            touched={touched}
                            errors={errors}
                          />
                          <Password
                            name="password"
                            label="Password"
                            touched={touched}
                            errors={errors}
                          />

                          {error
                            ? error.graphQLErrors.map(err => {
                                let errMsg;
                                switch (err.message) {
                                  case 'DUPLICATE_USER':
                                    errMsg = 'Email is already registered.';
                                    break;
                                  case 'NOT_CONFIRMED':
                                    errMsg = (
                                      <>
                                        Email is not yet confirmed. To confirm
                                        your email{' '}
                                        <Link to="/join/confirm">
                                          click here
                                        </Link>
                                        .
                                      </>
                                    );
                                    break;
                                  case 'WRONG_CREDENTIALS':
                                    errMsg = 'Wrong email or password.';
                                    break;
                                  default:
                                    return null;
                                }

                                return (
                                  <IonItem key={err.message}>
                                    <IonLabel color="danger">{errMsg}</IonLabel>
                                  </IonItem>
                                );
                              })
                            : null}
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
                              <IonIcon slot="start" name="add" />
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

                          <IonButton
                            expand="block"
                            color="primary"
                            type="submit"
                          >
                            <IonIcon slot="start" name="log-in" />
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
        }}
      </Mutation>
    );
  }
}

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

export const Login: React.SFC<
  RouteComponentProps<{}> & { admin?: boolean }
> = ({ history, admin = false }) => {
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

      <Footer />
    </>
  );
};

export const Admin: React.SFC<RouteComponentProps<{}>> = props => {
  return <Login {...props} admin />;
};
