import { Component, For, createSignal } from "solid-js";

import {
  gql,
  Client,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from "urql";
import { createClient, createClient as createWSClient } from "graphql-ws";

import { SubscriptionClient } from "subscriptions-transport-ws";

import { pipe, subscribe } from "wonka";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client/core";
import { getMainDefinition } from "@apollo/client/utilities";
import { useMutation } from "@apollo/client";

const [todos, setTodos] = createSignal<Todo[]>([]);

// const wsClient = createWSClient({
//   url: "ws://localhost:4000/graphql",
// });

// wsClient.on('connected', () => {
//   console.log('ws client connected');
// })


const client = new Client({
  url: "http://localhost:4000/graphql",
  exchanges: [
        cacheExchange,
        fetchExchange,
    // subscriptionExchange({
    //   forwardSubscription: (operation) =>
    //     subscriptionClient.request(operation) as any,
    // }),
  ],
});

// const subscriptionClient = new SubscriptionClient(
//   "ws://localhost:4000/graphql",
//   {
//     reconnect: true,
//   }
// );

// const httpLink = new HttpLink({
//   // You should use an absolute URL here
//   uri: "http://localhost:4000/graphql",
// });

// const wsLink = new GraphQLWsLink(
//   createClient({
//     url: "ws://localhost:4000/graphql",
//   })
// );

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
// const link = split(
//   // split based on operation type
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === "OperationDefinition" &&
//       definition.operation === "subscription"
//     );
//   },
//   wsLink,
//   httpLink
// );

// Instantiate client
// const client = new ApolloClient({
//   link,
//   uri: "http://localhost:4000/graphql",
//   cache: new InMemoryCache(),
// });

// const client = new Client({
//   url: "http://localhost:4000/graphql",
//   exchanges: [
//     cacheExchange,
//     fetchExchange,
//     // subscriptionExchange({
//     //   forwardSubscription(request) {
//     //     const input = { ...request, query: request.query || "" };
//     //     return {
//     //       subscribe(sink) {
//     //         const unsubscribe = wsClient.subscribe(input, sink);
//     //         console.log({input,request,sink})
//     //         return { unsubscribe };
//     //       },
//     //     };
//     //   },
//     // }),
//     subscriptionExchange({
//       forwardSubscription: (request) => subscriptionClient.request(request),
//     }),
//   ],
// });

const TodosQuery = gql`
  query {
    getTodos {
      id
      done
      text
    }
  }
`;

// const subscription = client.subscription<Todo[]>(
//   gql`
//     subscription {
//       todos {
//         id
//         text
//         done
//       }
//     }
//   `,
//   { initialValue: [] as Todo[] }
// );

// subscribe(() => setTodos(subscription.data.todos));

const getTodosSubscription = `
  subscription GetTodos {
    todos {
      id
      text
      done
    }
  }
`;

// const { unsubscribe } = pipe(
//   client.subscription(
//     `
//   subscription TodosSub {
//     todos {
//       id
//       done
//       text
//     }
//   }
// `,
//     {}
//   ),
//   subscribe((result) => {
//     setTodos(result.data.todos);
//   })
// );

const TODOS_SUBSCRIPTION = gql`
  subscription TodosSub {
    todos {
      id
      done
      text
    }
  }
`;

const { unsubscribe } = client
  .subscription(getTodosSubscription, {
    data: { todos: [] as Todo[] },
  })
  .subscribe((result) => {
    console.log({ result }); // { data: ... }
    setTodos(result.data.todos);
  });

// const [todos, { refetch }] = createResource(
//   () =>
//     client
//       .query(TodosQuery, {})
//       .toPromise()
//       .then((res) => res.data.getTodos as Todo[]),
//   { initialValue: [] as Todo[] }
// );

const SETDONE_TODO = gql`
  mutation ($id: ID!, $done: Boolean!) {
    setDone(id: $id, done: $done) {
      id
    }
  }
`;

const App: Component = () => {
  const [text, setText] = createSignal("");

  const toggle = async (id: Todo["id"]) => {
    const todo = todos().find((todo) => todo.id === id);
    if (!todo) {
      throw new Error(`Todo ${id} not found`);
    }

    await client
      .mutation(
        gql`
          mutation ($id: ID!, $done: Boolean!) {
            setDone(id: $id, done: $done) {
              id
            }
          }
        `,
        {
          id,
          done: !todo.done,
        }
      )
      .toPromise();

    // const [setDone] = useMutation(SETDONE_TODO);
    // setDone({
    //   variables: {
    //     id,
    //     done: !todo.done,
    //   },
    // });

    // refetch();
  };

  const onAdd = async () => {
    await client
      .mutation(
        gql`
          mutation ($text: String!) {
            addTodo(text: $text) {
              id
            }
          }
        `,
        { text: text() }
      )
      .toPromise();
    // refetch();
    setText("");
  };

  return (
    <div>
      <For each={todos()}>
        {({ id, text, done }) => (
          <div>
            <input type="checkbox" checked={done} onClick={() => toggle(id)} />
            <span>{text}</span>
          </div>
        )}
      </For>
      <div>
        <input
          type="text"
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
        />
        <button type="button" aria-label="Add a todo item" onClick={onAdd}>
          Add
        </button>
      </div>
    </div>
  );
};

export default App;
