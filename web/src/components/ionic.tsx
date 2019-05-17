import { IonButton, IonItem, IonTabButton } from '@ionic/react';
import { Omit } from 'lodash';
import * as React from 'react';
import { withRouter } from 'react-router';

type Props<T extends React.ElementType> = Omit<
  React.ComponentPropsWithRef<T> & {
    href: string;
    replace?: boolean;
  },
  'onClick'
>;

function addRouter<T extends React.ComponentType>(
  Comp: T,
): React.ComponentType<Props<T>> {
  const Component = Comp as Function;
  const comp = ({
    history,
    location,
    match,
    staticContext,
    replace = false,
    ...props
  }) => {
    return (
      <Component
        {...props}
        onClick={e => {
          e.preventDefault();

          if (props.href) {
            const method = replace ? history.replace : history.push;
            method(props.href);
          }
        }}
      />
    );
  };
  return withRouter(comp as any);
}

export const IonButtonLink = addRouter(IonButton);
export const IonItemLink = addRouter(IonItem);
