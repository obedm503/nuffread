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
import { Routes, TopNav } from '../components';
import { NavbarLink } from '../components/navbar-link';
import { Home } from './home';
import { Pricing } from './pricing';

const routes: RouteProps[] = [
  { path: '/pricing', component: Pricing },
  { path: '/', component: Home },
];

export const SellPublic: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
  <>
    <TopNav>
      <NavbarBrand>
        <NavbarItem>company logo</NavbarItem>
        <NavbarItem>Sell</NavbarItem>
        <NavbarBurger isActive={false} />
      </NavbarBrand>

      <NavbarMenu>
        <NavbarStart>
          <NavbarLink href="/sell">Home</NavbarLink>
          <NavbarLink href="/sell/pricing">Pricing</NavbarLink>
        </NavbarStart>

        <NavbarEnd>
          <NavbarItem>Buy Books</NavbarItem>
        </NavbarEnd>
      </NavbarMenu>
    </TopNav>

    <main className="has-navbar-fixed-top">
      <Routes base={match.url} routes={routes} />
    </main>
  </>
);
