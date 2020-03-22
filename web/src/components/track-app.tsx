import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonPage,
  IonRow,
} from '@ionic/react';
import { UnregisterCallback } from 'history';
import React, { Component, ErrorInfo } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { tracker } from '../state';
import { TopNav } from './top-nav';

export const TrackApp = withRouter(
  class Tracker extends Component<RouteComponentProps, { hasError: boolean }> {
    state = { hasError: false };
    componentDidCatch(
      { name, message, stack }: Error,
      { componentStack }: ErrorInfo,
    ) {
      tracker.event('RENDER_ERROR', { name, message, stack, componentStack });

      // remove modals because they're not removed automatically by
      // ionic when trashing the tree
      try {
        const root = document.getElementById('root');
        const modals = root!.getElementsByTagName('ion-modal');
        Array.from(modals).forEach(modal => {
          modal.remove();
        });
      } catch {}
    }
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    unsub: UnregisterCallback;
    componentDidMount() {
      const loc = this.props.history.location;
      let from = loc.pathname + loc.search;
      this.unsub = this.props.history.listen(location => {
        const to = location.pathname + location.search;
        if (to === from) {
          return;
        }
        tracker.event('NAVIGATE', {
          from,
          to,
        });
        from = to;
      });
    }
    componentWillUnmount() {
      this.unsub && this.unsub();
    }
    render() {
      if (this.state.hasError) {
        return (
          <IonPage>
            <TopNav homeHref="/" />

            <IonContent>
              <IonGrid>
                <IonRow>
                  <IonCol
                    size="12"
                    sizeSm="8"
                    offsetSm="2"
                    sizeMd="6"
                    offsetMd="3"
                    sizeLg="4"
                    offsetLg="4"
                    sizeXl="2"
                    offsetXl="5"
                  >
                    <IonCard color="white">
                      <IonCardHeader>
                        <IonCardTitle>Oops!</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        An unexpected error occurred. Reloading the page might
                        help.
                      </IonCardContent>
                      <IonItem
                        button
                        color="primary"
                        onClick={() => window.location.reload()}
                      >
                        Reload
                      </IonItem>
                    </IonCard>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonContent>
          </IonPage>
        );
      }

      return this.props.children;
    }
  },
);
