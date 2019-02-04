import { Container, Content, Hero, HeroBody } from 'bloomer';
import * as React from 'react';

export const Footer = () => (
  <Hero tag="footer" isColor="light">
    <HeroBody>
      <Container>
        <Content hasTextAlign="centered">
          <p>
            <strong>NuffRead</strong> &copy; Copyright{' '}
            {new Date().getFullYear()}
          </p>
        </Content>
      </Container>
    </HeroBody>
  </Hero>
);
