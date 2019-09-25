import mean from 'lodash/mean';
import memoize from 'lodash/memoize';
import * as React from 'react';

type Props = { color: string };

export const ProgressBar: React.FC<Props & { value: number }> = ({
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
