import { memo } from 'react';
import { classes } from '../util';

export const Icon = memo<{ icon: string; className?: string }>(
  ({ icon, className }) => {
    const iconSvg = icon.replace('data:image/svg+xml;utf8,', '');

    return (
      <div
        className={classes(
          'align-middle inline-block fill-current',
          className?.includes('w-') ? '' : 'w-5',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    );
  },
);
