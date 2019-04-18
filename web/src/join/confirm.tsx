import {
  Button,
  Column,
  Columns,
  Container,
  Content,
  Hero,
  HeroBody,
} from 'bloomer';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import * as React from 'react';
import { Mutation } from 'react-apollo';
import { Redirect, RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { Error, IonIcon } from '../components';
import { Email } from '../controls';
import { UserConsumer } from '../state/user';
import { Color } from '../util';

const RESEND_EMAIL = gql`
  mutation ResendEmail($binId: String, $email: String) {
    resendEmail(binId: $binId, email: $email)
  }
`;

class ResendEmail extends React.PureComponent<{ binId: string }> {
  render() {
    return (
      <Mutation<GQL.IMutation>
        mutation={RESEND_EMAIL}
        variables={{ binId: this.props.binId }}
      >
        {(mutate, { loading, error }) => {
          if (error) {
            return <Error value={error} />;
          }

          return (
            <Button
              onClick={() => mutate()}
              isColor={'primary' as Color}
              isLoading={loading}
            >
              Click here to resend email.
            </Button>
          );
        }}
      </Mutation>
    );
  }
}

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .required()
    .email()
    .test(
      'edu',
      'Must be student email',
      value => !!value && value.endsWith('.edu'),
    ),
});

class ConfirmEmail extends React.Component<{
  history: History;
}> {
  render() {
    return (
      <Mutation<GQL.IMutation> mutation={RESEND_EMAIL}>
        {(mutate, { loading, data, error }) => {
          if (data && data.resendEmail) {
            return <Redirect to={`/join/confirm/${data.resendEmail}`} />;
          }

          return (
            <Formik<{ email: string }>
              onSubmit={({ email }) => mutate({ variables: { email } })}
              validationSchema={emailSchema}
              initialValues={{ email: '' }}
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

                    {error
                      ? error.graphQLErrors.map(err => {
                          if (err.message === 'WRONG_CREDENTIALS') {
                            return (
                              <div className="field" key={err.message}>
                                <p className="help is-danger">
                                  Email is not registered.
                                  <Button href="/join/signup">
                                    <IonIcon name="add" />
                                    <span>Join Instead</span>
                                  </Button>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })
                      : null}

                    <Button isPulled="right" isColor="primary" type="submit">
                      <IonIcon name="log-in" />
                      <span>Send Email</span>
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

export class Confirm extends React.PureComponent<
  RouteComponentProps<{ binId?: string }>
> {
  render() {
    return (
      <Hero isFullHeight>
        <HeroBody>
          <Container>
            <Columns isCentered>
              <Column isSize={4}>
                <UserConsumer>
                  {({ user }) => {
                    if (user) {
                      return <Redirect to="/" />;
                    }

                    if (!this.props.match.params.binId) {
                      return <ConfirmEmail history={this.props.history} />;
                    }

                    return (
                      <Content>
                        <p className="is-size-5">
                          An email has been sent to your email. Please click the
                          link to confirm and continue to your account.
                        </p>
                        <p className="is-size-5">
                          <ResendEmail binId={this.props.match.params.binId} />
                        </p>
                      </Content>
                    );
                  }}
                </UserConsumer>
              </Column>
            </Columns>
          </Container>
        </HeroBody>
      </Hero>
    );
  }
}
