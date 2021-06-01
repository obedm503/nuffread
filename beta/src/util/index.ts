const filterKeys = (o: { [key: string]: any }): string[] =>
  Object.keys(o).filter(key => o[key]);
export const classes = (
  ...names: Array<undefined | string | { [key: string]: any }>
) =>
  names
    .map(name => {
      if (!name) {
        return '';
      }
      if (typeof name === 'string') {
        return name;
      }
      return filterKeys(name).join(' ');
    })
    .filter(Boolean)
    .join(' ');
