export const schools: {
  [domain: string]: { displayName: string } | undefined;
} = {
  'dordt.edu': { displayName: 'Dordt University' },
  'calvin.edu': { displayName: 'Calvin University' },
};

export const getSchoolName = (email: string): string | undefined => {
  const [user, domain] = email.split('@');
  const school = schools[domain];
  return school && school.displayName;
};
