/* not being used; for reference on using casual with mocks */
import casual from 'casual';

const mocks = {
  Query: () => ({
    person: (root, args) => {
      return { id: args.id, firstName: args.firstName, lastName: args.lastName };
},
  }),
  Person: () => ({ id: () => casual.id, firstName: () => casual.first_name, lastName: () => casual.last_name }),
};

export default mocks;