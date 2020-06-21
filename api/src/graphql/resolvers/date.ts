import {
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
  Kind,
  ValueNode,
} from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';

class Config implements GraphQLScalarTypeConfig<Date, string> {
  name = 'Date';
  description = 'Maps between ISO-8601 formatted dates and Date objects';

  parseValue(value: string): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): string {
    return value.toISOString(); // value sent to the client
  }
  parseLiteral(valueNode: ValueNode): Maybe<Date> {
    if (valueNode.kind === Kind.STRING) {
      return this.parseValue(valueNode.value); // ast value is always in string format
    }
    return null;
  }
}

export const DateResolver = new GraphQLScalarType(new Config());
