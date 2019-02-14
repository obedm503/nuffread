import { Container, Hero, HeroBody, NavbarBrand, Title } from 'bloomer';
import * as React from 'react';
import { NavbarLink, TopNav } from '../components';

export const Launch = () => (
  <>
    <TopNav isColor="primary" hasShaddow={false}>
      <NavbarBrand>
        <NavbarLink href="/">NuffRead</NavbarLink>
      </NavbarBrand>
    </TopNav>

    <main className="has-navbar-fixed-top">
      <Hero isColor="primary" isFullHeight>
        <HeroBody>
          <Container>
            <Title
              style={{
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              <span>NuffRead</span>
              <span
                className="has-text-weight-light has-text-black"
                style={{ borderLeft: '1rem solid transparent' }}
              >
                is Coming Soon
              </span>
            </Title>
          </Container>
        </HeroBody>
      </Hero>
    </main>
  </>
);
