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
import { TopNav } from './components';
import { Email, Password } from './controls';
import { IMutation, UserType } from './schema.gql';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: UserType!) {
    login(email: $email, password: $password, type: $type)
  }
`;

class LoginForm extends React.Component<{
  type: keyof typeof UserType;
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
                            <IonButton expand="block" href="/join/signup">
                              <IonIcon slot="start" name="add" />
                              <IonLabel>Join</IonLabel>
                            </IonButton>
                          </IonCol>
                        )}

                        <IonCol>
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
const sellerSchema = yup.object().shape({
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
                    type={admin ? 'ADMIN' : 'SELLER'}
                    schema={admin ? adminSchema : sellerSchema}
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
};

export const Admin: React.SFC<RouteComponentProps<{}>> = props => {
  return <Login {...props} admin />;
};
