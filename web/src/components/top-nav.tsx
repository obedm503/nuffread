import { IonNav, IonToolbar } from '@ionic/react';
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
  className?: string;
  isTopColor?: Color;
  color?: Color;
  hasShaddow?: boolean;
  children: RenderChildren;
};
export class TopNav extends React.PureComponent<Props, { isActive: boolean }> {
  state = { isActive: false };
  onClick: React.MouseEventHandler = () =>
    this.setState(({ isActive }) => ({ isActive: !isActive }));

  render() {
    const {
      children,
      className,
      isTopColor = 'primary',
      color,
      hasShaddow = true,
    } = this.props;
    return (
      <IonNav color={color}>
        <IonToolbar>
          {typeof children === 'function'
            ? (children as Function)({
                isActive: this.state.isActive,
                onClick: this.onClick,
              })
            : children}
        </IonToolbar>
      </IonNav>
    );
  }
}

export const NavbarLink: React.SFC<{ href: string; className?: string }> = ({
  children,
  href,
  className,
}) => (
  <NavLink
    to={href}
    className={classes('navbar-item', className)}
    activeClassName="is-active"
    exact
  >
    {children}
  </NavLink>
);
