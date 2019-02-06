import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { classes } from '../util';

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
