import {
  NavbarBrand,
  NavbarBurger,
  NavbarEnd,
  NavbarMenu,
  NavbarStart,
} from 'bloomer';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { NavbarLink, Routes, TopNav } from '../components';
import { Home } from './home';
import { Pricing } from './pricing';
import { Register } from './register';

const routes: RouteProps[] = [
  { path: '/pricing', component: Pricing },
  { path: '/signup', component: Register },
  { path: '/', component: Home },
];

export const Join: React.SFC<RouteComponentProps<{}>> = ({
  match,
  location,
}) => (
  <>
    <TopNav>
      {({ isActive, onClick }) => (
        <>
          <NavbarBrand>
            <NavbarLink href="/">NuffRead</NavbarLink>
            <NavbarBurger isActive={isActive} onClick={onClick} />
          </NavbarBrand>

          <NavbarMenu isActive={isActive}>
            <NavbarStart>
              <NavbarLink href="/">Search</NavbarLink>
              <NavbarLink href="/join/pricing">Pricing</NavbarLink>
            </NavbarStart>

            {location.pathname.endsWith('/join/signup') ? null : (
              <NavbarEnd>
                <NavbarLink href="/join/signup">Signup</NavbarLink>
              </NavbarEnd>
            )}
          </NavbarMenu>
        </>
      )}
    </TopNav>

    <main className="has-navbar-fixed-top">
      <Routes base={match.url} routes={routes} />
    </main>
  </>
);
