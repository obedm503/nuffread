import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import { UserConsumer, UserState } from '../state/user';
import { normalizeUrl } from '../util';
import { Icon } from './icon';

export const navMessages = {
  en: {
    nav: {
      home: 'Home',
      users: 'Users',
      organizations: 'Organizations',
      surveys: 'Surveys',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      users: 'Usuarios',
      organizations: 'Organizaciones',
      surveys: 'Encuestas',
    },
  },
};

const makeLinks = (type?: number) => {
  if (!type) {
    return [];
  }
  let links;
  if (type === 2) {
    links = [
      {
        to: '/s',
        label: 'nav.surveys',
      },
    ];
  } else {
    links = [
      {
        to: '/u',
        label: 'nav.users',
      },
      {
        to: '/o',
        label: 'nav.organizations',
      },
    ];
  }
  return links;
};

type Props = {
  className: string;
  base: string;
};

type State = {
  active: boolean;
};

class Photo extends React.PureComponent<any, { hasError: boolean }> {
  state = { hasError: false };
  onError = () => {
    this.setState({ hasError: true });
  };
  withUser = ({ user }: UserState) => {
    if (!user || !('photo' in user) || !user.photo) {
      return null;
    }

    if (this.state.hasError) {
      return (
        <>
          <Icon id="photo-placeholder" name="person" />
          <hr className="navbar-divider" />
        </>
      );
    }

    return (
      <>
        <figure className="image is-128x128">
          <img
            src={user.photo + '?sz=128'}
            style={{ maxHeight: '100%' }}
            onError={this.onError}
          />
        </figure>
        <hr className="navbar-divider" />
      </>
    );
  };
  render() {
    return <UserConsumer children={this.withUser} />;
  }
}

export class OldTopNav extends React.PureComponent<Props, State> {
  state = { active: false };

  toggle = () => this.setState({ active: !this.state.active });

  links = ({ type }: any) =>
    makeLinks(type).map(({ to, label, exact }) => {
      const url = normalizeUrl([this.props.base, to]);
      return (
        <NavLink
          key={url}
          className="navbar-item"
          activeClassName="is-active"
          exact={exact}
          to={url}
        >
          <FormattedMessage id={label} />
        </NavLink>
      );
    });
  render() {
    const { className, base } = this.props;
    const { active } = this.state;
    const activeClass = active ? 'is-active' : '';
    return (
      <nav
        className={`navbar is-fixed-top ${className}`}
        role="navigation"
        aria-label="dropdown navigation"
      >
        <div className="shadow" />
        <div className="container">
          <div className="navbar-brand">
            <span className="navbar-item">
              <img
                src="https://engageforequity.org/wp-content/uploads/2017/03/house-hands-icon.png"
                alt="Engage for Equity"
              />
            </span>
            <button
              className={`navbar-burger button is-white ${activeClass}`}
              onClick={this.toggle}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
          <div className={`navbar-menu ${activeClass}`}>
            <div className="navbar-start" onClick={this.toggle}>
              <NavLink
                className="navbar-item"
                activeClassName="is-active"
                exact
                to="/"
              >
                <FormattedMessage id="nav.home" />
              </NavLink>
              <UserConsumer children={this.links} />
            </div>

            <div className="navbar-end">
              <div className="navbar-item has-dropdown is-hoverable">
                <i className="navbar-link" />

                <div className="navbar-dropdown is-right">
                  <Photo />
                  <NavLink className="navbar-item" to="/logout" target="_self">
                    <Icon name="log-out" />
                    <span>
                      <FormattedMessage id="Logout" />
                    </span>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
