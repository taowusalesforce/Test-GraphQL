import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import bodyParser from "body-parser";
import mySchema from "./data/schema";
import { createServer } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { publishPersonChanged } from "./data/resolvers";

const GRAPHQL_PORT = 3000;

const graphQLServer = express();

graphQLServer.use("/graphql", bodyParser.json(), graphqlExpress({ schema: mySchema }));
graphQLServer.use(
  "/graphiql",
  graphiqlExpress({
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}/subscriptions`
  })
);

const ws = createServer(graphQLServer);

ws.listen(GRAPHQL_PORT, () => {
  console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
  );
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema: mySchema
    },
    {
      server: ws,
      path: "/subscriptions"
    }
  );
});

/*
  Postgres notification listener. 
  @TODO write a generic notification sorter: have the notification contain the type and payload JSON object
  should be hierarchical (sibling to type, e.g, { type: personChanged, payload: [id: "1", first_name: "mike"]}))
  so we can just pass it through to resolver. Putting off figuring out postgresql function in favor of the simple
  flat model for now: { subscriptionName: personChanged, prop1:val1...} and then build our payload as
  This tightly couples our notification shape to our graphql model
  (sent in JSON column names need to match our graphql model properties) but allows us to ignore the payload itself
  as it will automatically map. 
  @TODO Is there a filter metadata we could pass in?
*/
var pg = require("pg");
//  @TODO source connection string per environment
const connectionString = "postgres://ec2-54-225-192-243.compute-1.amazonaws.com/den4j9m1o09qek";
const client = new pg.Client(connectionString);
client.connect(function(err, client) {
  console.log("connecting");
  if (err) {
    console.log(err);
  }
  //this is called whenever postgres sends a notification
  client.on("notification", function(msg) {
    //see the function in postgres which constructs and sends the message via person table triggers
    if (msg.name === "notification" && msg.channel === "person_table_update") {
      const newPerson = JSON.parse(msg.payload);
      //We want to use the same PubSub instance of the subscription, which lives in resolver; we can either
      //export the PubSub and have people publishing from here, or encapsulate the publishing functions
      //in the resolver (or elsewhere). Choosing the latter for now.
      publishPersonChanged(newPerson);
    }
  });
  client.query("LISTEN person_table_update");
});

export default client;
