import * as React from 'react';
import { useRouter } from '../state/router';
import { IonBackButton } from '@ionic/react';

export const GoBack: React.FC<{ base: string }> = ({ base }) => {
  const {
    history,
    location: { pathname },
  } = useRouter();
  if (base === pathname) {
    return null;
  }
  // force display with the defaultHref prop
  return <IonBackButton onClick={history.goBack} defaultHref="" />;
};
