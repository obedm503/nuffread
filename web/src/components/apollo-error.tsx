import { ApolloError } from 'apollo-client';
import { GraphQLError } from 'graphql';
import * as React from 'react';
import { ControlError } from './controls/control';

export const apolloFormErrors = (handlers: {
  [message: string]:
    | React.ReactNode
    | React.FunctionComponent<{ error: GraphQLError }>;
}) => ({ error }: { error?: ApolloError }) => {
  const errors = error && error.graphQLErrors;
  if (!errors) {
    return null;
  }
  return (
    <>
      {errors.map(e => {
        const Render = handlers[e.message];
        if (!Render) {
          // unhandled error
          throw error;
        }
        return (
          <ControlError key={e.message}>
            {typeof Render === 'function' ? (
              <Render error={e}></Render>
            ) : (
              Render
            )}
          </ControlError>
        );
      })}
    </>
  );
};
