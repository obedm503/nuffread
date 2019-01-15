import * as React from 'react';
import { ControlProps } from './control';
import { Text } from './text';

export const Percent: React.SFC<ControlProps & { values: any }> = ({
  label,
  ...props
}) => {
  const fullLabel = (
    <>
      {label} ({props.values[props.name]}
      %)
    </>
  );
  return (
    <Text
      title={`${props.values[props.name]}%`}
      type="range"
      className="slider is-fullwidth"
      min={0}
      max={100}
      step={0.01}
      label={fullLabel}
      {...props}
    />
  );
};
