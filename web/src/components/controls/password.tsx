import { IonButton, IonIcon } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import * as React from 'react';
import { ControlProps } from './control';
import { Text } from './text';

export const Password: React.FC<
  ControlProps & {
    autoComplete?: 'current' | 'new';
  }
> = React.memo(function Password({ autoComplete = 'current', ...props }) {
  const [isVisible, setVisible] = React.useState(false);
  const toggle = React.useCallback(
    () => setVisible(visibility => !visibility),
    [setVisible],
  );

  const type = isVisible ? 'text' : 'password';
  const icon = isVisible ? eye : eyeOff;

  return (
    <Text {...props} type={type} autocomplete="on">
      <IonButton slot="end" fill="clear" onClick={toggle}>
        <IonIcon slot="icon-only" color="medium" icon={icon} />
      </IonButton>
    </Text>
  );
});
