import { IonButton, IonIcon, IonPopover } from '@ionic/react';
import * as React from 'react';

export class Popover extends React.Component {
  state = { open: false };
  open = () => this.setState({ open: !this.state.open });
  close = () => this.setState({ open: false });
  render() {
    return (
      <IonButton onClick={this.open}>
        <IonIcon name="more" />
        <IonPopover isOpen={this.state.open} onDidDismiss={this.close}>
          {this.props.children}
        </IonPopover>
      </IonButton>
    );
  }
}
