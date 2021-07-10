import { memo } from 'react';
import { classes } from '../util';

export const Icon = memo<{ icon: string; className?: string }>(
  ({ icon, className }) => {
    const iconSvg = icon.replace('data:image/svg+xml;utf8,', '');

    return (
      <div
        className={classes(
          'w-5 align-middle inline-block fill-current',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    );
  },
);
