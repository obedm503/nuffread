import { Field, FieldProps } from 'formik';
import { range } from 'lodash';
import * as React from 'react';
import { Control, ControlProps } from './control';

const thisYear = new Date().getFullYear();

type PickerProps = {
  color?: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  value: number;
  style?: any;
  name: string;
};
const Picker: React.FC<
  PickerProps & {
    options: number[];
    label: any;
  }
> = ({ color, onChange, value, options, style, name, label }) => (
  <label style={{ width: '100%' }}>
    <span>{label}</span>
    <div className={`select is-fullwidth ${color}`}>
      <select
        onChange={onChange}
        value={Number.isInteger(value) ? value.toString() : ''}
        style={style}
        name={name}
      >
        {options.map(n => (
          <option value={n.toString()} key={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  </label>
);

const YearPicker: React.FC<PickerProps> = props => (
  <Picker
    {...props}
    label="Year"
    options={range(6).map(n => thisYear + n)}
    style={{
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    }}
  />
);

const MonthPicker: React.FC<PickerProps> = props => (
  <Picker
    {...props}
    label="Month"
    options={range(12).map(n => n + 1)}
    style={{
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    }}
  />
);

const getNumberOfDays = (realMonth: number) => {
  const zeroIndexedMonth = realMonth - 1; // month is 0-indexed
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(zeroIndexedMonth + 1); // set next month
  date.setDate(0); // date is 1-indexed, so this will set to the last date of the previous month
  return date.getDate(); // returns the last date of the month
};
const DayPicker: React.FC<PickerProps & { month: number }> = ({
  month,
  ...props
}) => (
  <Picker
    {...props}
    label="Day"
    options={range(getNumberOfDays(month)).map(n => n + 1)}
    style={{
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    }}
  />
);

const localToUtc = (local: string) => {
  const [year, month, day] = local.split('-').map(Number);
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year);
  date.setMonth(month - 1); // month is 0-indexed
  date.setDate(day);
  return date.toISOString();
};
const utcToLocal = (utc: string) => {
  const date = new Date(utc);
  date.setHours(0, 0, 0, 0);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // month is 0-indexed
    day: date.getDate(),
  };
};

type DatePickerProps = FieldProps<string> & { color?: string };
type DatePickerState = { year: number; month: number; day: number };
class DatePicker extends React.PureComponent<DatePickerProps, DatePickerState> {
  constructor(props) {
    super(props);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    this.state = {
      year: now.getFullYear(),
      month: now.getMonth() + 1, // month is 0-indexed
      day: now.getDate(),
    };
  }

  static getDerivedStateFromProps(nextProps) {
    return utcToLocal(nextProps.field.value);
  }

  onChange = (keyName: keyof DatePickerState) => (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    let value: string | number = e.target['value'];
    if (!value) {
      return;
    }
    value = Number(value);

    const newState: Partial<DatePickerState> = { [keyName]: value };
    if (keyName === 'month' && this.state.day > getNumberOfDays(value)) {
      newState.day = 1;
    }

    const { year, month, day } = { ...this.state, ...newState };
    const localDateString = [year, month, day].join('-');
    const utc = localToUtc(localDateString);
    this.props.form.setFieldValue(this.props.field.name, utc);
  };
  render() {
    const { value, ...field } = this.props.field;
    const { year, month, day } = utcToLocal(value);
    return (
      <div style={{ display: 'flex' }} onBlur={field.onBlur}>
        <YearPicker
          name={field.name}
          onChange={this.onChange('year')}
          color={this.props.color}
          value={year}
        />
        <MonthPicker
          name={field.name}
          onChange={this.onChange('month')}
          color={this.props.color}
          value={month}
        />
        <DayPicker
          name={field.name}
          onChange={this.onChange('day')}
          color={this.props.color}
          value={day}
          month={month}
        />
      </div>
    );
  }
}

const DateControl: React.FC<ControlProps & { errors }> = props => (
  <Control {...props}>
    {color => <Field color={color} component={DatePicker} name={props.name} />}
  </Control>
);

export { DateControl as Date };
