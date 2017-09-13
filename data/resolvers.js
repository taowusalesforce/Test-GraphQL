import { Person } from "./connectors.js";
import { client } from "../server.js";
import { PubSub, withFilter } from "graphql-subscriptions";
import { AsyncIterator } from "asynciterator";

//this publishes within node.js; the Subscription lists the subscribers
const pubsub = new PubSub();

const resolvers = {
  Query: {
    person(_, args) {
      return Person.find({ where: args });
    }
  },
  Subscription: {
    personChanged: {
      //use withFilter here if needed
      subscribe: () => pubsub.asyncIterator("personChanged")
    }
  }
};

//this publishes (within node.js) a notification which is then picked up by subscriptions (above)
//TODO make this generic where the payload provides the publish params
export const publishPersonChanged = function(notificationPayload) {
  pubsub.publish("personChanged", {
    personChanged: notificationPayload
  });
};

export default resolvers;
