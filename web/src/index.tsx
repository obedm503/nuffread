import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import React from 'react';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './app';
import * as serviceWorker from './serviceWorker';
import { tracker } from './state';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    tracker.event('GRAPHQL_ERROR', {
      errors: graphQLErrors,
    });
  }

  if (networkError) {
    tracker.event('NETWORK_ERROR', {
      error: networkError,
    });
  }
});

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API,
  credentials: 'include',
});
const wsLink = new WebSocketLink({
  uri: process.env.REACT_APP_WS!,
  options: { reconnect: true },
});

const client = new ApolloClient({
  link: errorLink.concat(
    // split based on operation type
    split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    ),
  ),
  cache: new InMemoryCache({
    possibleTypes: { SystemUser: ['Admin', 'User'] },
  }),
});

const main = (
  <HelmetProvider>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </HelmetProvider>
);

render(main, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register({
//   async onUpdate() {
//     const toast = document.createElement('ion-toast');
//     toast.message = 'A new version of nuffread is available';
//     toast.position = 'bottom';
//     toast.buttons = [
//       {
//         text: 'Refresh',
//         role: 'destructive',
//         handler: () => {
//           window.location.reload();
//         },
//       },
//     ];
//     document.body.appendChild(toast);
//     toast.present && toast.present();
//   },
// });
serviceWorker.unregister();

if (module['hot']) {
  module['hot'].accept();
}
