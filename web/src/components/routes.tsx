import { IonRouterOutlet } from '@ionic/react';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';
import { normalizeUrl } from '../util';

type Props = {
  routes: RouteProps[];
  base?: string;
};

const mapRoutes = ({ routes, base }: Props) => {
  return routes.map(({ path, ...route }: RouteProps, i?: number) => {
    let fullPath: string | undefined = (base
      ? normalizeUrl([base].concat(path!))
      : path) as any;

    // IonRouterOutlet freaks out with undefiend path prop, it shouldn't
    // if (fullPath === '/' || fullPath === '.') {
    //   fullPath = undefined;
    // }

    return <Route key={fullPath || i} path={fullPath} {...route} />;
  });
};

export class Routes extends React.Component<Props> {
  render() {
    return <Switch>{mapRoutes(this.props)}</Switch>;
  }
}

export class IonRoutes extends React.Component<Props> {
  render() {
    return <IonRouterOutlet>{mapRoutes(this.props)}</IonRouterOutlet>;
  }
}
