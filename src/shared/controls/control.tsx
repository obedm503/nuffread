import * as React from 'react';

export type ControlProps = {
  label: React.ReactNode;
  error?: React.ReactNode;
  name: string;
  touched?;
  errors;
  values?;
  children?: ((color: string) => React.ReactNode) | React.ReactNode;
};

export const Control: React.SFC<ControlProps> = ({
  label,
  error,
  name,
  touched,
  errors,
  children,
}) => {
  const showError = (touched ? touched[name] : true) && errors[name];
  const color = showError ? 'is-danger' : '';
  const field =
    typeof children === 'function' ? (children as Function)(color) : children;
  const errorMessage = error || (errors[name] ? errors[name] : '');
  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">{field}</div>
      {showError ? <p className={`help ${color}`}>{errorMessage}</p> : null}
    </div>
  );
};
