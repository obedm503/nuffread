import * as React from 'react';

const style = { paddingTop: '0.5rem', paddingBottom: '0.5rem' };

export const Section: React.SFC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, ...props }) => (
  <section className={`section ${props.className || ''}`} style={style}>
    {children}
  </section>
);
