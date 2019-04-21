const {
  DEFAULT_INTERFACE_BUILDER,
  DEFAULT_TYPE_BUILDER,
  DEFAULT_EXPORT_FUNCTION,
} = require('@gql2ts/language-typescript');

module.exports = {
  typeMap: {
    Date: 'Date',
  },
  generateNamespace: (
    _,
    interfaces,
  ) => `// AUTOMATICALLY GENERATED FILE - DO NOT EDIT
  
// tslint:disable
  
${interfaces}
  
// tslint:enable
  `,
  interfaceBuilder: (name, body) =>
    DEFAULT_EXPORT_FUNCTION(DEFAULT_INTERFACE_BUILDER(name, body)),
  typeBuilder: (name, body) =>
    DEFAULT_EXPORT_FUNCTION(DEFAULT_TYPE_BUILDER(name, body)),
  enumTypeBuilder: (name, values) => {
    const enumType = `enum ${name} ${values}`;
    return DEFAULT_EXPORT_FUNCTION(enumType);
  },
};
