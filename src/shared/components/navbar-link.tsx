import * as React from 'react';
import { NavLink } from 'react-router-dom';

export const NavbarLink: React.SFC<{ href: string }> = ({ children, href }) => (
  <NavLink to={href} className="navbar-item" activeClassName="is-active" exact>
    {children}
  </NavLink>
);
