import {
  Button,
  Column,
  Columns,
  Container,
  Content,
  Hero,
  HeroBody,
} from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Mutation } from 'react-apollo';
import { Redirect, RouteComponentProps } from 'react-router';
import { Color } from '../util';
import { Error } from '../components';
import { UserConsumer } from '../state/user';

const RESEND_EMAIL = gql`
  mutation ResendEmail($id: String!) {
    resendEmail(id: $id)
  }
`;

class ResendEmail extends React.PureComponent<{ binId: string }> {
  render() {
    return (
      <Mutation<GQL.IMutation>
        mutation={RESEND_EMAIL}
        variables={{ id: this.props.binId }}
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

export class Confirm extends React.PureComponent<
  RouteComponentProps<{ binId: string }>
> {
  render() {
    return (
      <UserConsumer>
        {({ user }) => {
          console.log('binId', this.props.match.params.binId);
          if (user) {
            return <Redirect to="/" />;
          }

          return (
            <Hero isFullHeight>
              <HeroBody>
                <Container>
                  <Columns isCentered>
                    <Column isSize={4}>
                      <Content>
                        <p className="is-size-5">
                          An email has been sent to your email. Please click the
                          link to confirm and continue to your account.
                        </p>
                        <p className="is-size-5">
                          <ResendEmail binId={this.props.match.params.binId} />
                        </p>
                      </Content>
                    </Column>
                  </Columns>
                </Container>
              </HeroBody>
            </Hero>
          );
        }}
      </UserConsumer>
    );
  }
}
