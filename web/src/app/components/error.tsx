import * as React from 'react';

export const Error = ({ value }) => {
  if (process.env.NODE_ENV === 'production') {
    console.error(value);
    return null;
  }
  return (
    <div className="container" style={{ overflow: 'hidden' }}>
      <h2 className="title has-text-danger">Error</h2>
      <pre className="has-text-danger" style={{ overflowX: 'auto' }}>
        <code>{JSON.stringify(value, null, 2)}</code>
      </pre>
    </div>
  );
};
