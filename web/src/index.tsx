import { ApolloProvider } from '@apollo/react-hooks';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ApolloClient } from 'apollo-client';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { UnregisterCallback } from 'history';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { RouteComponentProps, withRouter } from 'react-router';
import { App, createCache } from './app';
import * as serviceWorker from './serviceWorker';
import { ErrorBoundary, tracker } from './state/tracker';

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

const client = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: createCache(),
});

const WrappedApp = withRouter(
  class extends Component<RouteComponentProps> {
    unsub: UnregisterCallback;
    componentDidMount() {
      this.unsub = this.props.history.listen(location => {
        tracker.event('NAVIGATE', { to: location.pathname + location.search });
      });
    }
    componentWillUnmount() {
      this.unsub && this.unsub();
    }
    render() {
      return <App></App>;
    }
  },
);

const main = (
  <ErrorBoundary>
    <HelmetProvider>
      <ApolloProvider client={client}>
        <IonApp>
          <IonReactRouter>
            <WrappedApp />
          </IonReactRouter>
        </IonApp>
      </ApolloProvider>
    </HelmetProvider>
  </ErrorBoundary>
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
