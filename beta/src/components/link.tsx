import NextLink from 'next/link';
import { classes } from '../util';

export function Link({ href, children, block = true }) {
  return (
    <NextLink href={href}>
      <a
        className={classes(
          'text-center text-primary underline hover:text-secondary',
          { block },
        )}
      >
        {children}
      </a>
    </NextLink>
  );
}
