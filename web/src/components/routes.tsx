import { IonRouterOutlet } from '@ionic/react';
import { ViewManager } from '@ionic/react-router';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';
import { normalizeUrl } from '../util';

type Props = {
  routes: RouteProps[];
  base?: string;
};

const mapRoutes = ({ routes, base }: Props) => {
  return routes.map(({ path, ...route }: RouteProps, i) => {
    let fullPath = path;
    if (base) {
      fullPath = normalizeUrl([base].concat(path!));
    }

    if (fullPath === '/' || fullPath === '.') {
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
    return (
      <ViewManager>
        <IonRouterOutlet>{mapRoutes(this.props)}</IonRouterOutlet>
      </ViewManager>
    );
  }
}
