import { readFileSync } from "node:fs";
import { createYoga, createSchema } from "graphql-yoga";
import { createServer } from "http";
import { todoResolvers } from "./graphql/resolvers/todo.resolver";

const typeDefs = readFileSync("./graphql/types/todoType.graphql", "utf8");
const resolvers = todoResolvers;

const schema = createSchema({ typeDefs, resolvers });
const yoga = createYoga({ schema });
const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
