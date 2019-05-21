import { IonButton, IonIcon, IonPopover } from '@ionic/react';
import * as React from 'react';

export class Popover extends React.Component {
  state = { open: false };
  toggle = () => this.setState({ open: !this.state.open });
  close = () => this.setState({ open: false });

  render() {
    return (
      <IonButton onClick={this.toggle}>
        <IonIcon slot="icon-only" name="more" />

        <IonPopover isOpen={this.state.open} onDidDismiss={this.close}>
          {this.state.open ? this.props.children : null}
        </IonPopover>
      </IonButton>
    );
  }
}
