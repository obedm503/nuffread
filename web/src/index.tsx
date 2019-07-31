import { IonApp, IonReactRouter } from '@ionic/react';
import { ApolloClient } from 'apollo-client';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App, createCache } from './app';
import * as serviceWorker from './serviceWorker';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API,
  credentials: 'include',
});

const errorLink = onError(({ networkError }) => {
  // logout on unauthorized error
  if (networkError && (networkError as any)['statusCode'] === 401) {
    localStorage.removeItem('token');
    window.location.replace('/');
  }
});

const client = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: createCache(),
});

const main = (
  // <UAProvider value={navigator.userAgent}>
  // <HostProvider value={location.origin}>
  <HelmetProvider>
    <ApolloProvider client={client}>
      <IonReactRouter>
        <IonApp>
          <App />
        </IonApp>
      </IonReactRouter>
    </ApolloProvider>
  </HelmetProvider>
  // </HostProvider>
  // </UAProvider>
);

ReactDOM.render(main, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

if (module['hot']) {
  module['hot'].accept();
}
