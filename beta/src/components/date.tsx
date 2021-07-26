import {
  differenceInDays,
  differenceInSeconds,
  formatDistanceToNow,
} from 'date-fns';
import upperFirst from 'lodash/upperFirst';
import { Component } from 'react';
import { Scalars } from '../queries';

type Props = { date?: Scalars['Date'] };
export class RelativeDate extends Component<Props> {
  lastRender?: Date;
  shouldComponentUpdate(nextProps: Props) {
    if (this.props.date !== nextProps.date) {
      // date changed
      return true;
    }
    if (!this.lastRender) {
      // first render
      return true;
    }
    if (differenceInSeconds(new Date(), this.lastRender) > 2) {
      // if more than 2 seconds have passed since last render
      this.lastRender = new Date();
      return true;
    }

    return false;
  }
  render() {
    const { date } = this.props;
    if (!date) {
      return null;
    }
    const value = new Date(date);

    const diff = differenceInDays(new Date(), value);
    if (diff > 8) {
      return <>{value.toLocaleDateString('en-US')}</>;
    }
    return <>{upperFirst(formatDistanceToNow(value, { addSuffix: true }))}</>;
  }
}
