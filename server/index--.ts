// import {
//   Repeater,
//   YogaServer,
//   createPubSub,
//   createSchema,
//   createYoga,
//   map,
//   pipe,
// } from "graphql-yoga";
// import { createServer } from "node:http";
// import { WebSocketServer } from "ws";
// import { useServer } from "graphql-ws/lib/use/ws";
// import { makeExecutableSchema } from "@graphql-tools/schema";
// import { loadFiles, loadFilesSync } from "@graphql-tools/load-files";
// import path from "node:path";
// // import { typeDefs } from "./graphql/typeDefs";

// const TODOS_CHANNEL = "TODOS_CHANNEL";

// const pubSub = createPubSub();

// type Todo = {
//   id: string;
//   text: string;
//   done: boolean;
// };

// let todos: Array<Todo> = [
//   {
//     id: "1",
//     text: "Learn GraphQL + Solid",
//     done: false,
//   },
// ];

// const resolvers = {
//   Query: {
//     getTodos: () => todos,
//   },
//   Subscription: {
//     todos: {
//       // subscribe: (_, _2, context: any) => {
//       //   const iterator = context.asyncIterator(TODOS_CHANNEL);
//       //   pubSub.publish(TODOS_CHANNEL, { todos });
//       //   return iterator;
//       // },
//       // subscribe: () =>
//       //   pipe(
//       //     Repeater.merge([undefined, pubSub.subscribe(TODOS_CHANNEL)]),
//       //     // map all stream values to the latest user
//       //     // map(() => todos)
//       //     map(() => {
//       //       // pubSub.publish(TODOS_CHANNEL, { todos });
//       //       return todos;
//       //     })
//       //   ),
//         subscribe: () => pubSub.asyncIterator([TODOS_CHANNEL]),
//       resolve: (value: any) => value,
//     },
//   },
//   Mutation: {
//     addTodo: (_: unknown, { text }: Pick<Todo, "text">) => {
//       const newTodo = {
//         id: String(todos.length + 1),
//         text,
//         done: false,
//       };
//       todos.push(newTodo);
//       pubSub.publish(TODOS_CHANNEL, { todos });
//       return newTodo;
//     },
//     setDone: (_: unknown, { id, done }: Pick<Todo, "id" | "done">) => {
//       const todo = todos.find((todo) => todo.id === id);
//       if (!todo) {
//         throw new Error(`Todo ${id} not found`);
//       }
//       todo.done = done;
//       pubSub.publish(TODOS_CHANNEL, { todos });
//       return todo;
//     },
//   },
// };

// const typeDefs = path.join(__dirname, "graphql/typeDefs/schema.graphql")

// const yoga = createYoga({
//   context: { pubSub },
//   schema: createSchema({
//     typeDefs,
//     resolvers,
//   }),
// });

// // const serverWS = new WebSocketServer({
// //   port: 4000,
// //   path: "/graphql",
// // });

// const schema = makeExecutableSchema({ typeDefs, resolvers });
// // const server = new ApolloServer({
// //   schema,
// // });
// // useServer({ schema }, serverWS);

// // serverWS.on("listening", () => {
// //   console.info("Server is running on http://localhost:4000/graphql");
// // });

// // const server = createServer(yoga);

// // server.listen(4000, () => {
// //   console.info("Server is running on http://localhost:4000/graphql");
// //   // useServer({ schema }, serverWS);
// // });

// // server.on("connect", () => {
// //   console.info("Server is running on http://localhost:4000/graphql");
// // })
