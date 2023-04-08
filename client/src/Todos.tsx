import {
  For,
  Index,
  Match,
  Switch,
  createEffect,
  createSignal,
} from "solid-js";

import { gql, Client, cacheExchange, fetchExchange } from "urql";
import {
  createQuery,
  useQueryClient,
  createMutation,
  createInfiniteQuery,
} from "@tanstack/solid-query";

const GET_TODOS = gql`
  query {
    getTodos {
      id
      done
      text
    }
  }
`;

// const fetchTodos = () => client.query<Todo[]>(TodosQuery, {});
// const fetchTodos = () => client.query<Todo[]>(TodosQuery, {}).toPromise();

const [todos, setTodos] = createSignal<Todo[]>([]);

const client = new Client({
  url: "http://localhost:4000/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

const TODOS_SUBSCRIPTION = gql`
  subscription TodosSub {
    todos {
      id
      done
      text
    }
  }
`;

const SETDONE_TODO = gql`
  mutation ($id: ID!, $done: Boolean!) {
    setDone(id: $id, done: $done) {
      id
    }
  }
`;

export function Todos() {
  const queryClient = useQueryClient();
  const [text, setText] = createSignal("");
  const fetchTodos = () =>
    client
      .query<{ getTodos: Todo[] }>(GET_TODOS, {})
      .toPromise()
      .then((res) => res.data?.getTodos ?? ([] as Todo[]));

  const query = createQuery(() => ["todos"], fetchTodos);
  //   const query = createQuery({
  //     queryKey: () => ["todos"],
  //     queryFn: fetchTodos,
  //     // refetchInterval: 100,
  //   });
  createEffect(() => console.log(query));

  const toggle = async (id: Todo["id"]) => {
    const todo = todos().find((todo) => todo.id === id);
    if (!todo) {
      throw new Error(`Todo ${id} not found`);
    }

    // const mutation = createMutation(
    //   ["TodoMutation"],
    //   () => console.log("mutation"),
    //   {
    //     onSuccess: () => {
    //       // ✅ refetch the comments list for our blog post
    //       queryClient.invalidateQueries({
    //         queryKey: ["posts", id, "comments"],
    //       });
    //     },
    //   }
    // );

    const mutation = createMutation({
      mutationFn: () =>
        client
          .mutation(SETDONE_TODO, {
            id,
            done: !todo.done,
          })
          .toPromise(),
      onSuccess: () =>
        // queryClient.invalidateQueries({ queryKey: [() => ["todos"]] }),
        queryClient.invalidateQueries(["todos"]),
    });
    mutation.mutate();

    // await client
    //   .mutation(
    //     gql`
    //       mutation ($id: ID!, $done: Boolean!) {
    //         setDone(id: $id, done: $done) {
    //           id
    //         }
    //       }
    //     `,
    //     {
    //       id,
    //       done: !todo.done,
    //     }
    //   )
    //   .toPromise();

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
      {/* <For each={todos()}>
        {({ id, text, done }) => (
          <div>
            <input type="checkbox" checked={done} onClick={() => toggle(id)} />
            <span>{text}</span>
          </div>
        )}
          </For> */}

      <Switch>
        <Match when={query.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={query.isError}>
          <p>Error: {(query.error as Error).message}</p>
        </Match>
        <Match when={query.isSuccess}>
          <Index each={query.data}>
            {(todo) => (
              <div>
                <input
                  type="checkbox"
                  checked={todo().done}
                  onClick={() => toggle(todo().id)}
                />
                <span>{todo().text}</span>
              </div>
            )}
          </Index>
        </Match>
      </Switch>
      <div>
        <input
          type="text"
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
        />
        <button
          type="button"
          aria-label="Add a todo item"
          onClick={onAdd}
          disabled={text() === ""}
        >
          Add
        </button>
      </div>
    </div>
  );
}
