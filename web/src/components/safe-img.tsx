import * as React from 'react';

export class SafeImg extends React.PureComponent<{
  src?: string;
  alt: string;
  slot?: string;
  placeholder: string;
  style?: React.CSSProperties;
}> {
  state = { hasError: false, loaded: false };
  onError = () => {
    this.setState({ hasError: true });
  };
  onLoad = () => {
    this.setState({ loaded: true });
  };
  componentDidMount() {
    if (!this.props.src) {
      return;
    }
    const img = new Image();
    img.src = this.props.src;
    img.onload = this.onLoad;
    img.onerror = this.onError;
  }
  render() {
    const { placeholder, slot, alt, style } = this.props;
    const { hasError, loaded } = this.state;
    const src = (hasError ? placeholder : this.props.src) || placeholder;
    return (
      <img
        slot={slot}
        src={loaded ? src : placeholder}
        style={style}
        alt={alt}
      />
    );
  }
}
