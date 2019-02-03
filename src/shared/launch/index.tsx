import { Container, NavbarBrand, NavbarItem } from 'bloomer';
import * as React from 'react';
import { TopNav } from '../components';

export const Launch = () => (
  <>
    <TopNav>
      <NavbarBrand>
        <NavbarItem>NuffRead</NavbarItem>
      </NavbarBrand>
    </TopNav>

    <main className="has-navbar-fixed-top">
      <Container>
        <div>coming soon</div>
      </Container>
    </main>
  </>
);
