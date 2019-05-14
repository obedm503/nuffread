import { IonTitle, IonToolbar, IonButton } from '@ionic/react';
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { classes, Color } from '../util';

type RenderChildren =
  | React.ReactNode
  | ((props: {
      onClick: React.MouseEventHandler;
      isActive: boolean;
    }) => React.ReactNode);

type Props = {
  color?: Color;
  children?: RenderChildren;
};
export class TopNav extends React.PureComponent<Props, { isActive: boolean }> {
  state = { isActive: false };
  onClick: React.MouseEventHandler = () =>
    this.setState(({ isActive }) => ({ isActive: !isActive }));

  render() {
    const { children, color } = this.props;
    return (
      <IonToolbar color={color}>
        <IonTitle>
          <IonButton href="/" color="light" fill="clear">
            nuffread
          </IonButton>
        </IonTitle>

        {typeof children === 'function'
          ? (children as Function)({
              isActive: this.state.isActive,
              onClick: this.onClick,
            })
          : children}
      </IonToolbar>
    );
  }
}
