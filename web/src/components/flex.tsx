import * as React from 'react';

export const Flex: React.FC<{ style? }> = ({ style, children }) => (
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
