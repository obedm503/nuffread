import { Field, FieldProps } from 'formik';
import * as React from 'react';
import { Control, ControlProps } from './control';

type Props = ControlProps & {
  multiple?: boolean;
  children: React.ReactNode;
};

class MulitpleSelect extends React.Component<FieldProps<any>> {
  onChange = e => {
    const value = Array.from(e.target.options as any[])
      .map(op => (op.selected ? op.value : ''))
      .filter(Boolean)
      .join(',');
    this.props.form.setFieldValue(this.props.field.name, value);
  };
  render() {
    const {
      field: { value, onChange, ...rest },
      children,
    } = this.props;
    return (
      <select
        multiple={true}
        value={value.split(',')}
        onChange={this.onChange}
        {...rest}
      >
        {children}
      </select>
    );
  }
}

export const Select: React.SFC<Props> = ({
  children,
  multiple = false,
  ...props
}) => (
  <Control {...props}>
    {color => {
      const className = `select is-fullwidth ${color} ${
        multiple ? 'is-multiple' : ''
      }`;
      return (
        <div className={className}>
          <Field
            component={multiple ? MulitpleSelect : 'select'}
            multiple={multiple}
            name={props.name}
          >
            <option />
            {children}
          </Field>
        </div>
      );
    }}
  </Control>
);
