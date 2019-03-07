import { isNil } from 'lodash';
import * as React from 'react';
import { Route, RouteProps, Switch } from 'react-router';
import { normalizeUrl } from '../util';

type Props = {
  routes: RouteProps[];
  base?: string;
  [key: string]: any;
};

export class Routes extends React.Component<Props> {
  render() {
    const { routes, base, children: routesChildren, ...rest } = this.props;
    return (
      <Switch>
        {routes.map(({ path, component, children, render, ...route }, i) => {
          let fullPath: string | undefined = (base
            ? normalizeUrl([base].concat(path!))
            : path) as any;
          if (fullPath === '/' || fullPath === '.') {
            fullPath = undefined;
          }

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
        })}
      </Switch>
    );
  }
}
