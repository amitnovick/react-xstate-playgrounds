import React from 'react';
import { useMachine } from '@xstate/react';
import { Machine, assign } from 'xstate';

// const URL = 'https://jsonplaceholder.typicode.com/todos';
// const fetchUser = query => fetch(`${URL}/${query}`).then(res => res.json());

const fetchUser = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ name: 'Bob' });
    }, 1000);
  });

const fetchMachine = Machine(
  {
    id: 'fetch',
    initial: 'idle',
    context: {
      user: null,
      error: null
    },
    states: {
      idle: {
        on: { FETCH: 'loading' }
      },
      loading: {
        invoke: {
          src: (ctx, event) => fetchUser('1'),
          onDone: {
            target: 'success',
            actions: assign({
              user: (_, event) => event.data
            })
          },
          onError: {
            target: 'failure',
            actions: assign({ error: (ctx, event) => event.data })
          }
        }
      },
      success: {
        onEntry: 'notifyResolve',
        type: 'final'
      },
      failure: {
        onEntry: 'notifyResolve',
        type: 'final'
      }
    }
  },
  {
    actions: {
      notifyResolve: (ctx, event) => console.log('notify', 'ctx:', ctx)
    }
  }
);

function Fetcher() {
  const [current, send] = useMachine(fetchMachine);

  switch (current.value) {
    case 'idle':
      return (
        <button onClick={() => send({ type: 'FETCH', query: '1' })}>
          Search for something
        </button>
      );
    case 'loading':
      return <div>Searching...</div>;
    case 'failure':
      return <div>Failure :-(</div>;
    case 'success':
      return <div>Success! Data: {JSON.stringify(current.context.user)}</div>;
    default:
      return null;
  }
}

export default Fetcher;
