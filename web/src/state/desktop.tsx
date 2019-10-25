import * as React from 'react';

const { Provider, Consumer } = React.createContext<{ isDesktop: boolean }>({
  isDesktop: false,
});
export { Consumer as IsDesktop };

export class IsDesktopProvider extends React.PureComponent<
  any,
  { isDesktop: boolean }
> {
  state = { isDesktop: false };
  match: MediaQueryList;
  onChange = (e: MediaQueryListEvent) => {
    this.setState({ isDesktop: e.matches });
  };
  componentDidMount() {
    this.match = matchMedia('(min-width: 992px)');

    this.setState({ isDesktop: this.match.matches });

    this.match.addListener(this.onChange);
  }
  componentWillUnmount() {
    if (this.match) {
      this.match.removeListener(this.onChange);
    }
  }
  render() {
    return <Provider value={this.state}>{this.props.children}</Provider>;
  }
}

type OnlyProps = { children: React.FC };
export const OnlyMobile: React.FC<OnlyProps> = ({ children: Render }) => (
  <Consumer>
    {({ isDesktop }) => {
      if (isDesktop) {
        return null;
      }
      return <Render />;
    }}
  </Consumer>
);
