import * as React from 'react';
import { Section } from './section';

export const PrintPage: React.SFC = ({ children }) => (
  <Section className="print-page">
    <div className="content">{children}</div>
  </Section>
);
