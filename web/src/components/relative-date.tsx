import { differenceInDays, formatDistanceToNow } from 'date-fns';
import upperFirst from 'lodash/upperFirst';
import React, { FC } from 'react';

export const RelativeDate: FC<{ date?: Date }> = ({ date }) => {
  if (!date) {
    return null;
  }
  const value = new Date(date);

  const diff = differenceInDays(new Date(), value);
  if (diff > 8) {
    return <>{value.toLocaleDateString()}</>;
  }
  return <>{upperFirst(formatDistanceToNow(value, { addSuffix: true }))}</>;
};
