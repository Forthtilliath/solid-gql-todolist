import { pipe, Repeater, map, createPubSub } from "graphql-yoga";
import { Resolvers } from "../../resolvers-types";
import { PubSub } from "graphql-subscriptions";

const pubSub = createPubSub();
// const pubSub = new PubSub();

const TODOS_CHANNEL = "TODOS_CHANNEL";

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

export const todoResolvers: Resolvers = {
  Query: {
    getTodos: () => todos,
  },
  Subscription: {
    todos: {
      //   subscribe: (_, _2, context: any) => {
      //     const iterator = context.asyncIterator(TODOS_CHANNEL);
      //     pubSub.publish(TODOS_CHANNEL, { todos });
      //     return iterator;
      //   },
      subscribe: () =>
        pipe(
          Repeater.merge([undefined, pubSub.subscribe(TODOS_CHANNEL)]),
          // map all stream values to the latest user
          map(() => todos)
          // map(() => {
          //   // pubSub.publish(TODOS_CHANNEL, { todos });
          //   return todos;
          // })
        ),
      // subscribe: () => pubSub.asyncIterator([TODOS_CHANNEL]) as any,
      // subscribe: () => ({
      //   [Symbol.asyncIterator]: () => pubSub.asyncIterator([TODOS_CHANNEL]),
      // }),
      resolve: (value: typeof todos) => {
        // pubSub.publish(TODOS_CHANNEL, { todos });
        console.log({ value });
        return value;
      },
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
      console.log(newTodo);
      pubSub.publish(TODOS_CHANNEL, { todos });
      return newTodo;
    },
    setDone: (_: unknown, { id, done }: Pick<Todo, "id" | "done">) => {
      const todo = todos.find((todo) => todo.id === id);
      if (!todo) {
        throw new Error(`Todo ${id} not found`);
      }
      todo.done = done;
      pubSub.publish(TODOS_CHANNEL, { todos });
      return todo;
    },
  },
};
