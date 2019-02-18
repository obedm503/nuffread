import { Bulma } from 'bloomer/lib/bulma';
import * as React from 'react';
import { getTheme, UAConsumer } from '../state/ua';
import { classes } from '../util';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { name: string };
    }
  }
}

export class IonIcon extends React.PureComponent<{
  name: string;
  size?: Bulma.Sizes;
  align?: Bulma.Alignments;
  className?: string;
  [key: string]: any;
}> {
  children = ua => {
    let name;
    if (this.props.name.startsWith('logo')) {
      name = this.props.name;
    } else {
      name = `${getTheme(ua)}-${this.props.name}`;
    }
    return <ion-icon name={name} />;
  };

  render() {
    const { className, name, size, align, ...rest } = this.props;

    return (
      <span
        className={classes('icon', className, {
          [`is-size-${size}`]: size,
          [`is-align-${align}`]: align,
        })}
        {...rest}
        aria-hidden="true"
      >
        <UAConsumer children={this.children} />
      </span>
    );
  }
}
