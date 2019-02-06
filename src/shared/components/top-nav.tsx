import { Container, Navbar } from 'bloomer';
import * as React from 'react';
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
  isColor?: Color;
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
      isTopColor,
      isColor,
      hasShaddow = true,
    } = this.props;
    return (
      <Navbar
        className={classes('is-fixed-top', className, {
          [`is-top-${isTopColor}`]: isTopColor,
          [`is-${isColor}`]: isColor,
        })}
      >
        {hasShaddow === false ? null : <div className="shadow" />}

        <Container>
          {typeof children === 'function'
            ? (children as Function)({
                isActive: this.state.isActive,
                onClick: this.onClick,
              })
            : children}
        </Container>
      </Navbar>
    );
  }
}
