import {
  NavbarBrand,
  NavbarBurger,
  NavbarDropdown,
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
import { Profile } from './profile';

const routes: RouteProps[] = [
  { path: '/profile', component: Profile },
  { path: '/', component: Home },
];

export const SellPrivate: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
  <>
    <TopNav>
      <NavbarBrand>
        <NavbarItem>NuffRead</NavbarItem>
        <NavbarItem>Sell</NavbarItem>
        <NavbarBurger isActive={false} />
      </NavbarBrand>

      <NavbarMenu>
        <NavbarStart>
          <NavbarLink href="/sell">Home</NavbarLink>
        </NavbarStart>

        <NavbarEnd>
          <NavbarItem hasDropdown isHoverable>
            <NavbarLink href="/sell/profile">John Doe</NavbarLink>
            <NavbarDropdown>
              <NavbarItem href="/sell/profile">My Profile</NavbarItem>
              <NavbarItem href="/sell/new">New Listing</NavbarItem>
              <NavbarItem href="/sell/listings">My Listings</NavbarItem>
            </NavbarDropdown>
          </NavbarItem>
        </NavbarEnd>
      </NavbarMenu>
    </TopNav>

    <main className="has-navbar-fixed-top">
      <Routes base={match.url} routes={routes} />
    </main>
  </>
);
