import {
  IonButtons,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/react';
import * as React from 'react';
import { IonButtonLink } from '../../components';

export class UserDetails extends React.PureComponent<
  {
    listingId: string;
  },
  { showSeller: boolean }
> {
  state = { showSeller: false };
  onClick = () => {
    this.setState({ showSeller: true });
  };
  render() {
    if (!this.state.showSeller) {
      return (
        <IonButton expand="block" onClick={this.onClick}>
          <IonIcon name="person" />

          <IonLabel>View Seller</IonLabel>
        </IonButton>
      );
    }

    return (
      <IonItem color="white">
        <IonImg slot="start" src="/img/128x128.png" />

        <IonLabel text-wrap>
          <p>
            <strong>John Doe</strong>
            <br />
            <small>Dordt University</small>
            <br />
            <small>
              <a href="mailto: john.doe@mail.com">john.doe@mail.com</a>
            </small>
            <br />
            <small>
              <a href="tel: +123456789">+123456789</a>
            </small>
          </p>

          <IonButtons>
            <IonButtonLink href="#">
              <IonIcon slot="icon-only" size="small" name="call" />
            </IonButtonLink>
            <IonButtonLink href="#">
              <IonIcon slot="icon-only" size="small" name="logo-facebook" />
            </IonButtonLink>
            <IonButtonLink href="#">
              <IonIcon slot="icon-only" size="small" name="mail" />
            </IonButtonLink>
          </IonButtons>
        </IonLabel>
      </IonItem>
    );
  }
}
