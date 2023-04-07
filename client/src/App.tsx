import { Component, For, createResource, createSignal } from "solid-js";

import { gql, Client, cacheExchange, fetchExchange } from "urql";
import { createClient } from "graphql-ws";

// const subscriptionClient = new SubscriptionClient

// const client = createClient({
//   url: "http://localhost:4000/graphql",
// });
const client = new Client({
  url: "http://localhost:4000/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

const TodosQuery = gql`
  query {
    getTodos {
      id
      done
      text
    }
  }
`;

const [todos, { refetch }] = createResource(
  () =>
    client
      .query(TodosQuery, {})
      .toPromise()
      .then((res) => res.data.getTodos as Todo[]),
  { initialValue: [] as Todo[] }
);

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
    refetch();
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
    refetch();
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
