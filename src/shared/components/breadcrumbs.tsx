import * as React from 'react';
import { Link } from 'react-router-dom';

type Route = [string, string | Element] | string | Element;
type Props = {
  routes: Array<Route>;
  className?: string;
};

const filterRoute = (route: Route) =>
  Boolean(Array.isArray(route) ? route[1] : route);
const getPathName = (item: Route) => {
  let path: string;
  let name: string | Element;
  if (Array.isArray(item)) {
    path = item[0];
    name = item[1];
  } else {
    path = '/#';
    name = item;
  }
  return { path, name };
};

export class Breadcrumbs extends React.Component<Props> {
  shouldComponentUpdate(next: Props) {
    const { routes, className } = this.props;
    const classNameEq = className === next.className;
    const routesArr = Array.isArray(routes) && Array.isArray(next.routes);
    const routesLenEq = routesArr && routes.length !== next.routes.length;
    const routesEq =
      routesLenEq &&
      routes.every((item, i) => {
        const pathName = getPathName(item);
        const nextPathName = getPathName(next.routes[i]);
        return (
          pathName.name === nextPathName.name &&
          pathName.path === nextPathName.path
        );
      });
    return !classNameEq || !routesArr || !routesLenEq || !routesEq;
  }
  render() {
    const { routes, className } = this.props;
    return (
      <nav className={`breadcrumb ${className || ''}`} aria-label="breadcrumbs">
        <ul>
          {routes.filter(filterRoute).map((item, i, arr) => {
            const active = !Array.isArray(item);
            const { path, name } = getPathName(item);
            return (
              <li className={active ? 'is-active' : ''} key={i}>
                <Link
                  className="link is-info"
                  aria-current={active ? 'page' : undefined}
                  to={path}
                >
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}
