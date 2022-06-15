import { memo } from 'react';
import { classes } from '../util';

export const Icon = memo<{ icon: string; className?: string }>(
  ({ icon, className }) => {
    const iconSvg = icon.replace('data:image/svg+xml;utf8,', '');
    return (
      <div
        style={{ fill: 'currentColor', height: '1.1em', width: '1.5em' }}
        className={classes('align-middle inline-block', className)}
        dangerouslySetInnerHTML={{ __html: iconSvg }}
      />
    );
  },
);
