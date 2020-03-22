import { IonButton, IonIcon, IonPopover } from '@ionic/react';
import { ellipsisHorizontal, ellipsisVertical } from 'ionicons/icons';
import * as React from 'react';

export class Popover extends React.PureComponent<{
  attached?: boolean;
}> {
  state = { event: undefined };
  toggle = (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ event: e.nativeEvent });
  };
  close = () => this.setState({ event: undefined });

  render() {
    const isOpen = !!this.state.event;
    return (
      <IonButton onClick={this.toggle}>
        <IonIcon
          slot="icon-only"
          md={ellipsisVertical}
          ios={ellipsisHorizontal}
        />

        <IonPopover
          isOpen={isOpen}
          event={this.props.attached ? this.state.event : undefined}
          onDidDismiss={this.close}
        >
          {this.props.children}
        </IonPopover>
      </IonButton>
    );
  }
}
