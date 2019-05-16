import { IonRouterOutlet, IonPage } from '@ionic/react';
import { isNil } from 'lodash';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';
import { normalizeUrl } from '../util';

type Props = {
  routes: RouteProps[];
  base?: string;
  [key: string]: any;
};

export const routes = ({
  routes,
  base,
  children: routesChildren,
  ...rest
}: Props) =>
  routes.map(({ path, component, children, render, ...route }, i) => {
    let fullPath: string | undefined = (base
      ? normalizeUrl([base].concat(path!))
      : path) as any;

    // IonRouterOutlet freaks out with undefiend path prop, it shouldn't
    // if (fullPath === '/' || fullPath === '.') {
    //   fullPath = undefined;
    // }

    const Component: any = component || render;
    const realChildren = !isNil(children)
      ? children
      : Component
      ? props => <Component {...props} {...rest} />
      : null;

    return (
      <Route
        key={fullPath || i}
        path={fullPath}
        children={realChildren}
        {...route}
      />
    );
  });

export class IonRoutes extends React.Component<Props> {
  render() {
    return <IonRouterOutlet>{routes(this.props)}</IonRouterOutlet>;
  }
}

export class Routes extends React.Component<Props> {
  render() {
    return <Switch>{routes(this.props)}</Switch>;
  }
}
