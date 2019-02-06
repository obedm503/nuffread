import {
  NavbarBrand,
  NavbarBurger,
  NavbarEnd,
  NavbarItem,
  NavbarMenu,
  NavbarStart,
} from 'bloomer';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Icon, Routes, TopNav } from '../components';
import { NavbarLink } from '../components/navbar-link';
import { Details } from './details';
import { Home } from './home';

const routes: RouteProps[] = [
  {
    path: '/:listingId/details',
    component: Details,
    exact: true,
  },
  {
    path: '/:listingId?',
    component: Home,
  },
];

export const Buy: React.SFC<RouteComponentProps<{}>> = ({ match }) => {
  return (
    <>
      <TopNav>
        {({ isActive, onClick }) => (
          <>
            <NavbarBrand>
              <NavbarItem>NuffRead</NavbarItem>
              <NavbarBurger isActive={isActive} onClick={onClick} />
            </NavbarBrand>

            <NavbarMenu isActive={isActive}>
              <NavbarStart>
                <NavbarLink href="/">Home</NavbarLink>
              </NavbarStart>

              <NavbarEnd>
                <NavbarLink href="/sell">
                  <Icon name="logo-usd" />
                  <span>Sell Your Books</span>
                </NavbarLink>
              </NavbarEnd>
            </NavbarMenu>
          </>
        )}
      </TopNav>

      <main className="has-navbar-fixed-top">
        <Routes key={match.url} base={match.url} routes={routes} />
      </main>
    </>
  );
};
