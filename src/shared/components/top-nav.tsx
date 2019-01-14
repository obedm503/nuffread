import * as React from 'react';
import { Navbar, Container } from 'bloomer';

export const TopNav: React.SFC = ({ children }) => (
  <Navbar className="is-fixed-top">
    <div className="shadow" />

    <Container>{children}</Container>
  </Navbar>
);
