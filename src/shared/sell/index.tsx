import {
  NavbarBrand,
  NavbarBurger,
  NavbarDropdown,
  NavbarEnd,
  NavbarItem,
  NavbarMenu,
  NavbarStart,
  DropdownDivider,
} from 'bloomer';
import * as React from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { Routes, TopNav, NavbarLink } from '../components';
import { Home } from './home';
import { Profile } from './profile';
import { Logout } from '../logout';

const routes: RouteProps[] = [
  { path: '/profile', component: Profile },
  { path: '/', component: Home },
];

export const Sell: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
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
              <NavbarLink href="/sell">Home</NavbarLink>
            </NavbarStart>

            <NavbarEnd>
              <NavbarItem hasDropdown isHoverable>
                <NavbarLink href="/sell/profile">John Doe</NavbarLink>
                <NavbarDropdown>
                  <NavbarLink href="/sell/profile">My Profile</NavbarLink>
                  <NavbarLink href="/sell/new">New Listing</NavbarLink>
                  <NavbarLink href="/sell/listings">My Listings</NavbarLink>

                  <DropdownDivider />
                  <Logout />
                </NavbarDropdown>
              </NavbarItem>
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
