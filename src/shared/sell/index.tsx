import {
  DropdownDivider,
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
import { NavbarLink, Routes, TopNav } from '../components';
import { Logout } from '../logout';
import { Home } from './home';
import { Listings } from './listings';
import { New } from './new';
import { Profile } from './profile';

const routes: RouteProps[] = [
  { path: '/profile', exact: true, component: Profile },
  { path: '/listings', exact: true, component: Listings },
  { path: '/new', exact: true, component: New },
  { path: '/', component: Home },
];

export const Sell: React.SFC<RouteComponentProps<{}>> = ({ match }) => (
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
              <NavbarLink href="/">Home</NavbarLink>
            </NavbarStart>

            <NavbarEnd>
              <NavbarItem hasDropdown isHoverable>
                <NavbarLink href="/profile">John Doe</NavbarLink>
                <NavbarDropdown>
                  <NavbarLink href="/profile">My Profile</NavbarLink>
                  <NavbarLink href="/new">New Listing</NavbarLink>
                  <NavbarLink href="/listings">My Listings</NavbarLink>

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
