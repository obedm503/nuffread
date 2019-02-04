import * as React from 'react';
import { Navbar, Container } from 'bloomer';
import { classes, BulmaColor } from '../util';

type Props = {
  className?: string;
  isTopColor?: BulmaColor;
  isColor?: BulmaColor;
  hasShaddow?: boolean;
};
export const TopNav: React.SFC<Props> = ({
  children,
  className,
  isTopColor: isTopColor,
  isColor,
  hasShaddow = true,
}) => (
  <Navbar
    className={classes('is-fixed-top', className, {
      [`is-top-${isTopColor}`]: isTopColor,
      [`is-${isColor}`]: isColor,
    })}
  >
    {hasShaddow === false ? null : <div className="shadow" />}

    <Container>{children}</Container>
  </Navbar>
);
