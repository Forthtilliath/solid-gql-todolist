import {
  PubSub,
  Repeater,
  createPubSub,
  createSchema,
  createYoga,
  map,
  pipe,
} from "graphql-yoga";
import { createServer } from "node:http";

const TODOS_CHANNEL = "TODOS_CHANNEL";

const pubsub = createPubSub();

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

let todos: Array<Todo> = [
  {
    id: "1",
    text: "Learn GraphQL + Solid",
    done: false,
  },
];

const typeDefs = /* GraphQL */ `
  type Todo {
    id: ID!
    text: String!
    done: Boolean!
  }
  type Query {
    getTodos: [Todo]!
  }
  type Mutation {
    addTodo(text: String!): Todo
    setDone(id: ID!, done: Boolean!): Todo
  }
  type Subscription {
    todos: [Todo]!
  }
`;

const resolvers = {
  Query: {
    getTodos: () => todos,
  },
  Subscription: {
    todos: {
      // subscribe: () => Repeater.merge([pubsub.subscribe(TODOS_CHANNEL)]),
      // subscribe: async function* () {
      //   return pubsub.subscribe(TODOS_CHANNEL);
      // },
      // subscribe: () => {
      //   // return pubsub.subscribe(TODOS_CHANNEL);
      //   return Repeater.merge([undefined, pubsub.subscribe(TODOS_CHANNEL)]);
      //   // pubsub.asyncIterator(TODOS_CHANNEL);
      // },
      subscribe: () =>
      pipe(
        Repeater.merge([
          undefined,
          pubsub.subscribe(TODOS_CHANNEL)
        ]),
        // map all stream values to the latest user
        map(() => todos)
      ),
    resolve: (payload: any) => payload
    },
  },
  Mutation: {
    addTodo: (_: unknown, { text }: Pick<Todo, "text">) => {
      const newTodo = {
        id: String(todos.length + 1),
        text,
        done: false,
      };
      todos.push(newTodo);
      pubsub.publish(TODOS_CHANNEL, { todos });
      return newTodo;
    },
    setDone: (_: unknown, { id, done }: Pick<Todo, "id" | "done">) => {
      const todo = todos.find((todo) => todo.id === id);
      if (!todo) {
        throw new Error(`Todo ${id} not found`);
      }
      todo.done = done;
      pubsub.publish(TODOS_CHANNEL, { todos });
      return todo;
    },
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
