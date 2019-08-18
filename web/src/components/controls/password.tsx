import * as React from 'react';
import { ControlProps } from './control';
import { Text } from './text';

export const Password: React.FC<
  ControlProps & { autoComplete?: 'current' | 'new' }
> = ({ autoComplete = 'current', ...props }) => (
  <Text type="password" {...props} autocomplete="on" required />
);
