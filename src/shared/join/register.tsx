import {
  Button,
  Column,
  Columns,
  Container,
  Hero,
  HeroBody,
  Content,
} from 'bloomer';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import * as React from 'react';
import { Mutation, MutationFn } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { Icon } from '../components';
import { Email, Password } from '../controls';
import { classes, passwordSchema, AuthErrors } from '../util';
import { Link } from 'react-router-dom';

const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password)
  }
`;

type FormSchema = { email: string; password: string; password2: string };
const schema = yup.object<FormSchema>().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email')
    .test(
      'edu',
      'Must be a student email',
      value => !!value && value.endsWith('.edu'),
    ),
  password: passwordSchema,
  password2: passwordSchema
    .clone()
    .test('same', 'Passphrases must match', function(value) {
      return (
        this.parent && this.parent.password && this.parent.password === value
      );
    }),
});

class RegisterForm extends React.Component<RouteComponentProps<never>> {
  onSubmit = (mutate: MutationFn<GQL.IMutation>) => ({ email, password }) =>
    mutate({
      variables: { email, password },
    });

  render() {
    return (
      <Mutation<GQL.IMutation> mutation={REGISTER}>
        {(mutate, { loading, error, data }) => {
          const duplicateUserError =
            error &&
            error.graphQLErrors.find(
              err => err.message === AuthErrors.duplicateUser,
            );

          return (
            <Formik<FormSchema>
              onSubmit={this.onSubmit(mutate)}
              validationSchema={schema}
              initialValues={{
                email: '',
                password: '',
                password2: '',
              }}
            >
              {({ touched, errors, values }) => {
                if (data && data.register) {
                  return (
                    <Content>
                      <p className="is-size-5">
                        An email has been sent to {values.email}. Please click
                        the link to confirm it and continue to your account.
                      </p>
                    </Content>
                  );
                }

                const className = classes({
                  'has-error': error,
                  'is-loading': loading,
                });
                return (
                  <Form>
                    <Email
                      className={className}
                      name="email"
                      label="Email"
                      touched={touched}
                      errors={errors}
                    />
                    <Password
                      className={className}
                      name="password"
                      label="Passphrase"
                      touched={touched}
                      errors={errors}
                    />
                    <Password
                      className={className}
                      name="password2"
                      label="Repeat Passphrase"
                      touched={touched}
                      errors={errors}
                    />

                    {duplicateUserError ? (
                      <p className="help is-danger">
                        User already exists. <Link to="/login">Login?</Link>
                      </p>
                    ) : null}

                    <Button isPulled="right" isColor="primary" type="submit">
                      <Icon name="add" />
                      <span>Join</span>
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

export const Register = props => (
  <Hero isFullHeight>
    <HeroBody>
      <Container>
        <Columns isCentered>
          <Column isSize={4}>
            <RegisterForm {...props} />
          </Column>
        </Columns>
      </Container>
    </HeroBody>
  </Hero>
);
