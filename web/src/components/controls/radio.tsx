import { Field, FieldProps } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

class RadioInput extends React.PureComponent<
  FieldProps<string> & { value?: string }
> {
  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { field, value, form } = this.props;

    if (e.target && e.target['checked']) {
      form.setFieldValue(field.name, value);
    }
  };

  render() {
    const { field, value } = this.props;
    return (
      <input
        type="radio"
        {...field}
        checked={field.value === value}
        onChange={this.onChange}
      />
    );
  }
}

type OptionProps = {
  name: string;
  value: any;
};
export const RadioOption: React.FC<OptionProps> = ({
  name,
  value,
  children,
}) => (
  <label className="radio">
    <Field name={name} value={value} component={RadioInput} />
    {children}
  </label>
);

type RadioProps = ControlProps & { children: React.ReactNode; errors };
export const Radio: React.FC<RadioProps> = ({ children, ...props }) => (
  <Control {...props}>
    <div className="radio-group">{children}</div>
  </Control>
);
