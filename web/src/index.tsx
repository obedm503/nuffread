import { ApolloProvider } from '@apollo/react-hooks';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import React from 'react';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { App, createCache } from './app';
import * as serviceWorker from './serviceWorker';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_API,
  credentials: 'include',
});

const client = new ApolloClient({
  link: httpLink,
  cache: createCache(),
});

const main = (
  // <UAProvider value={navigator.userAgent}>
  // <HostProvider value={location.origin}>
  <HelmetProvider>
    <ApolloProvider client={client}>
      <IonApp>
        <IonReactRouter>
          <App />
        </IonReactRouter>
      </IonApp>
    </ApolloProvider>
  </HelmetProvider>
  // </HostProvider>
  // </UAProvider>
);

render(main, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
  async onUpdate() {
    const toast = document.createElement('ion-toast');
    toast.message = 'A new version of nuffread is available';
    toast.position = 'bottom';
    toast.buttons = [
      {
        text: 'Refresh',
        role: 'destructive',
        handler: () => {
          window.location.reload();
        },
      },
    ];
    document.body.appendChild(toast);
    toast.present && toast.present();
  },
});

if (module['hot']) {
  module['hot'].accept();
}
