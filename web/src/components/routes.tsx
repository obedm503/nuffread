import { isNil, Omit } from 'lodash';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';
import { normalizeUrl } from '../util';

type Props = {
  routes: RouteProps[];
  base?: string;
  props?: { [key: string]: any };
};

const route = ({ base, props: rest = {} }: Omit<Props, 'routes'>) => (
  { path, component, children, render, ...route }: RouteProps,
  i?: number,
) => {
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
};

export class Routes extends React.Component<Props> {
  render() {
    const { base, props, routes } = this.props;
    return <Switch>{routes.map(route({ base, props }))}</Switch>;
  }
}

// export const IonRoutes = withRouter(
//   class IonRoutes extends React.Component<RouteComponentProps & Props> {
//     render() {
//       const {
//         routes,
//         base,
//         props,
//         location: { pathname },
//       } = this.props;
//       const matched = routes.find(r => !!matchPath(pathname, r));
//       if (!matched) {
//         return null;
//       }

//       const comp = route({ base, props })(matched);
//       return <IonRouterOutlet>{comp}</IonRouterOutlet>;
//     }
//   },
// );
