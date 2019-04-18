import * as React from 'react';
import { ControlProps } from './control';
import { Text } from './text';

export const Password: React.SFC<
  ControlProps & { autoComplete?: 'current' | 'new' }
> = ({ autoComplete = 'current', ...props }) => (
  <Text type="password" {...props} autoComplete={`${autoComplete}-password`} />
);
