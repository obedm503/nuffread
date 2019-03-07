import {
  NavbarBrand,
  NavbarBurger,
  NavbarEnd,
  NavbarItem,
  NavbarMenu,
} from 'bloomer';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes, TopNav, NavbarLink } from '../components';
import { Details } from './details';
import { Home } from './home';

const routes: RouteProps[] = [
  {
    path: '/:listingId/details',
    component: Details,
    exact: true,
  },
  { path: '/:listingId?', component: Home },
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
              <NavbarEnd>
                <NavbarLink href="/join">
                  <b>Join</b>
                </NavbarLink>
                <NavbarLink href="/login">
                  <span>Login</span>
                </NavbarLink>
              </NavbarEnd>
            </NavbarMenu>
          </>
        )}
      </TopNav>

      <main className="has-navbar-fixed-top">
        <Routes base={match.url} routes={routes} />
      </main>
    </>
  );
};