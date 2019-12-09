import { IonRouterOutlet } from '@ionic/react';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';
import { normalizeUrl } from '../util';

type Props = {
  routes: RouteProps[];
  base?: string;
};

export const mapRoutes = (
  { routes, base }: Props,
  isIonic: boolean = false,
) => {
  return routes.map(({ path, ...route }: RouteProps, i) => {
    let fullPath = path;
    if (base) {
      fullPath = normalizeUrl([base].concat(path!));
    }

    if (!isIonic && (fullPath === '/' || fullPath === '.')) {
      fullPath = undefined;
    }

    return (
      <Route key={(fullPath || i).toString()} path={fullPath} {...route} />
    );
  });
};

export class Routes extends React.PureComponent<Props> {
  render() {
    return <Switch>{mapRoutes(this.props)}</Switch>;
  }
}

export class IonRoutes extends React.PureComponent<Props> {
  render() {
    return <IonRouterOutlet>{mapRoutes(this.props, true)}</IonRouterOutlet>;
  }
}
