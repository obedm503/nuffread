import * as React from 'react';
import { ControlProps } from './control';
import { Text } from './text';

export const Email: React.FC<ControlProps> = props => (
  <Text type="email" {...props} autocomplete="on" required />
);
