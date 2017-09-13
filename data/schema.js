import { makeExecutableSchema } from 'graphql-tools';
import resolvers from './resolvers';

const typeDefs = `
type Person {
  id: String
  first_name: String
  last_name: String
}
type Query {
  person(id: String): Person
}
type Subscription {
  personChanged(first_name: String!): Person
}
`
const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
