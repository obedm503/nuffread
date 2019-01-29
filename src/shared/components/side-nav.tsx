import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { normalizeUrl } from '../util';

const links = base =>
  [
    {
      to: '/',
      label: 'nav.home',
      exact: true,
    },
    {
      to: '/u',
      label: 'nav.users',
    },
    {
      to: '/o',
      label: 'nav.organizations',
    },
  ].map(link =>
    Object.assign(link, {
      to: normalizeUrl([base, link.to]),
    }),
  );

type Props = {
  base: string;
};

export const SideNav: React.SFC<Props> = ({ base }) => (
  <aside className="menu">
    <ul className="menu-list">
      {links(base).map((link, i) => (
        <li key={i}>
          <NavLink activeClassName="is-active" exact={link.exact} to={link.to}>
            <FormattedMessage id={link.label} />
          </NavLink>
        </li>
      ))}
    </ul>
  </aside>
);
