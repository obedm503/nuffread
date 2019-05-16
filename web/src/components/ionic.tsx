import { IonButton, IonItem } from '@ionic/react';
import { Omit } from 'lodash';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

type AllowedComponent = typeof IonItem & typeof IonButton;

type Props<T extends React.ElementType> = Omit<
  React.ComponentPropsWithRef<T> & {
    href: string;
    replace?: boolean;
  },
  'onClick'
>;

const addRouter = (
  Comp: AllowedComponent,
): React.ComponentType<Props<typeof Comp>> => {
  const comp = ({
    history,
    location,
    match,
    staticContext,
    replace = false,
    ...props
  }: RouteComponentProps & Props<typeof Comp>) => {
    return (
      <Comp
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
};

export const IonButtonLink = addRouter(IonButton);
export const IonItemLink = addRouter(IonItem);
