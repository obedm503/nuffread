import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import { ApolloClient } from 'apollo-client';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { ApolloProvider } from 'react-apollo';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { App, createCache } from './app';
import { HostProvider } from './state/host';
import { UAProvider } from './state/ua';

const httpLink = createHttpLink({
  uri: process.env.API,
  credentials: 'include',
});

const errorLink = onError(({ networkError }) => {
  // logout on unauthorized error
  if (networkError && (networkError as any)['statusCode'] === 401) {
    localStorage.removeItem('token');
    location.replace('/');
  }
});

const client = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: createCache(),
});

const main = (
  <UAProvider value={navigator.userAgent}>
    <HostProvider value={location.origin}>
      <HelmetProvider>
        <ApolloProvider client={client}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </HelmetProvider>
    </HostProvider>
  </UAProvider>
);

ReactDOM.render(main, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
