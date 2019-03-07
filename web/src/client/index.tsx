import 'isomorphic-fetch';
import './main.scss';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { hydrate } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { App, createCache } from '../app/app';
import { HostProvider } from '../app/state/host';
import { UAProvider } from '../app/state/ua';

const httpLink = createHttpLink({
  uri: process.env.API,
  credentials: 'include',
});

const errorLink = onError(({ networkError }) => {
  // logout on unauthorized error
  if (networkError && networkError['statusCode'] === 401) {
    localStorage.removeItem('token');
    location.replace('/');
  }
});

const authLink = setContext((_, ctx) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return ctx;
  }
  return {
    headers: {
      ...ctx.headers,
      authorization: token,
    },
  };
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: createCache().restore(window['__APOLLO_STATE__']),
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

hydrate(main, document.getElementById('root'));
