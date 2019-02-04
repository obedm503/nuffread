import {
  Container,
  Hero,
  HeroBody,
  NavbarBrand,
  NavbarItem,
  Title,
} from 'bloomer';
import * as React from 'react';
import { TopNav } from '../components';

export const Launch = () => (
  <>
    <TopNav isColor="primary" hasShaddow={false}>
      <NavbarBrand>
        <NavbarItem>NuffRead</NavbarItem>
      </NavbarBrand>
    </TopNav>

    <main className="has-navbar-fixed-top">
      <Hero isColor="primary" isSize="medium" isFullHeight>
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
