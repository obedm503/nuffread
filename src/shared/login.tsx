import ApolloClient from 'apollo-client';
import {
  Button,
  Column,
  Columns,
  Container,
  Hero,
  HeroBody,
  NavbarBrand,
  NavbarItem,
} from 'bloomer';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import * as React from 'react';
import { Mutation, MutationFn } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { Icon, TopNav } from './components';
import { Email, Password } from './controls';

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
        {(mutate, { loading, client }) => {
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
                    {admin ? null : (
                      <Button href="/join">
                        <Icon name="add" />
                        <span>Join</span>
                      </Button>
                    )}
                    <Button isPulled="right" isColor="primary" type="submit">
                      <Icon name="log-in" />
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
  email: yup.string().email(),
  password: yup.string(),
});
const sellerSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .test('edu', 'Must be student email', (value: string) =>
      value.endsWith('.edu'),
    ),
  password: yup.string(),
});

export const Login: React.SFC<
  RouteComponentProps<{}> & { admin?: boolean }
> = ({ history, admin = false }) => {
  return (
    <>
      <TopNav>
        <NavbarBrand>
          <NavbarItem>NuffRead</NavbarItem>
        </NavbarBrand>
      </TopNav>

      <main className="has-navbar-fixed-top">
        <Hero isSize="medium">
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
