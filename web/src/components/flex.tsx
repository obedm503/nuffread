import * as React from 'react';

export const Flex: React.SFC<{ style? }> = ({ style, children }) => (
  <div
    style={{
      alignItems: 'center',
      justifyContent: 'space-between',
      ...style,
      display: 'flex',
    }}
  >
    {children}
  </div>
);
