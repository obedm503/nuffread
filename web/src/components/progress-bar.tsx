import { mean, memoize } from 'lodash';
import * as React from 'react';

type Props = { color: string };

export const ProgressBar: React.SFC<Props & { value: number }> = ({
  color,
  value,
}) => {
  const percent = `${value}%`;
  return (
    <progress className={`progress ${color}`} value={value} max="100">
      {percent}
    </progress>
  );
};

export class AvgBar extends React.PureComponent<Props & { numbers: number[] }> {
  mean = memoize(mean);
  render() {
    const { numbers, ...props } = this.props;
    const value = this.mean(numbers);
    return <ProgressBar {...props} value={value} />;
  }
}