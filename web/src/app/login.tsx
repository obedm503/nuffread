import ApolloClient from 'apollo-client';
import {
  Button,
  Column,
  Columns,
  Container,
  Hero,
  HeroBody,
  NavbarBrand,
} from 'bloomer';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import * as React from 'react';
import { Mutation, MutationFn } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { IonIcon, NavbarLink, TopNav } from './components';
import { Email, Password } from './controls';
import { AuthErrors } from './util';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: UserType!) {
    login(email: $email, password: $password, type: $type)
  }
`;

class LoginForm extends React.Component<{
  type: keyof typeof GQL.UserType;
  history: History;
  schema;
  admin?: boolean;
}> {
  onSubmit = (
    mutate: MutationFn<GQL.IMutation>,
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
      <Mutation<GQL.IMutation> mutation={LOGIN}>
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
                    <Email
                      className="is-horizontal"
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
                      ? error.graphQLErrors.map(err =>
                          AuthErrors[err.message] ? (
                            <div className="field" key={err.message}>
                              <p className="help is-danger">
                                {AuthErrors[err.message]}
                              </p>
                            </div>
                          ) : null,
                        )
                      : null}

                    {admin ? null : (
                      <Button href="/join">
                        <IonIcon name="add" />
                        <span>Join</span>
                      </Button>
                    )}
                    <Button isPulled="right" isColor="primary" type="submit">
                      <IonIcon name="log-in" />
                      <span>Login</span>
                    </Button>
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
      <TopNav>
        <NavbarBrand>
          <NavbarLink href="/">NuffRead</NavbarLink>
        </NavbarBrand>
      </TopNav>

      <main className="has-navbar-fixed-top">
        <Hero isFullHeight>
          <HeroBody>
            <Container>
              <Columns isCentered>
                <Column isSize={4}>
                  <LoginForm
                    history={history}
                    type={admin ? 'ADMIN' : 'SELLER'}
                    schema={admin ? adminSchema : sellerSchema}
                    admin={admin}
                  />
                </Column>
              </Columns>
            </Container>
          </HeroBody>
        </Hero>
      </main>
    </>
  );
};

export const Admin: React.SFC<RouteComponentProps<{}>> = props => {
  return <Login {...props} admin />;
};
