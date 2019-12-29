import * as React from 'react';
import { ControlProps } from './control';
import { Text } from './text';

export const Email: React.FC<ControlProps> = React.memo(function Email(props) {
  return <Text {...props} autocomplete="on" />;
});
