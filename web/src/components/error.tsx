import * as React from 'react';

export const Error = ({ value }) => {
  if (process.env.NODE_ENV === 'production') {
    throw value;
  }

  React.useEffect(() => {
    console.error(value);
  }, [value]);

  return (
    <div style={{ overflow: 'scroll' }}>
      <h2>Error</h2>
      <pre>
        <code>{JSON.stringify(value, null, 2)}</code>
      </pre>
    </div>
  );
};
