import * as React from 'react';

const { Provider, Consumer } = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});
export { Consumer as IsDesktop };

export class IsDesktopProvider extends React.Component<
  any,
  { isDesktop: boolean }
> {
  state = { isDesktop: false };
  match: MediaQueryList;
  onChange = e => {
    this.setState({ isDesktop: e.matches });
  };
  componentDidMount() {
    this.match = matchMedia('(min-width: 992px)');

    this.setState({ isDesktop: this.match.matches });

    this.match.addEventListener('change', this.onChange);
  }
  componentWillUnmount() {
    if (this.match) {
      this.match.removeEventListener('change', this.onChange);
    }
  }
  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

type OnlyProps = { children: () => React.ReactNode };
export const OnlyDesktop: React.SFC<OnlyProps> = ({ children }) => (
  <Consumer>
    {({ isDesktop }) => {
      if (!isDesktop) {
        return null;
      }
      return children();
    }}
  </Consumer>
);
export const OnlyMobile: React.SFC<OnlyProps> = ({ children }) => (
  <Consumer>
    {({ isDesktop }) => {
      if (isDesktop) {
        return null;
      }
      return children();
    }}
  </Consumer>
);
