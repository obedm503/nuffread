import { Container, Content, Hero, HeroBody } from 'bloomer';
import * as React from 'react';

export const Footer = () => (
  <Hero tag="footer" isColor="primary">
    <HeroBody>
      <Container>
        <Content hasTextAlign="centered">
          <p>
            <strong>Shellph</strong> &copy; Copyright {new Date().getFullYear()}
          </p>
        </Content>
      </Container>
    </HeroBody>
  </Hero>
);
