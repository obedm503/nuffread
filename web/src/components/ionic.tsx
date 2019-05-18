import { IonButton, IonItem } from '@ionic/react';
import { Omit } from 'lodash';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

type RequiredProps = {
  href: string;
  replace?: boolean;
};
type Props<T extends React.ElementType> = Omit<
  RouteComponentProps & React.ComponentPropsWithRef<T> & RequiredProps,
  'onClick'
>;

function addRouter<T extends React.ComponentType>(Comp: T) {
  const Component = Comp as Function;
  const comp: React.SFC<Props<T>> = ({
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
  return withRouter(comp);
}

export const IonButtonLink = addRouter(IonButton);
export const IonItemLink = addRouter(IonItem);
