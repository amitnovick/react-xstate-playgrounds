import React from 'react';
import { useMachine } from '@xstate/react';
import { Machine, assign } from 'xstate';

const fetchMachine = Machine({
  id: 'fetch',
  initial: 'idle',
  context: {
    data: undefined
  },
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: assign({
            data: (_, event) => event.data
          })
        }
      }
    },
    success: {
      onEntry: 'notifyResolve',
      type: 'final'
    }
  }
});

const URL = 'https://jsonplaceholder.typicode.com/todos';

function Fetcher({ onResolve }) {
  const [current, send] = useMachine(
    fetchMachine.withContext({
      actions: {
        notifyResolve: ctx => {
          onResolve(ctx.data);
        }
      },
      services: {
        fetchData: (ctx, event) =>
          fetch(`${URL}/${event.query}`).then(res => res.json())
        // console.log('fetching data')
      }
    })
  );

  switch (current.value) {
    case 'idle':
      return (
        <button onClick={() => send({ type: 'FETCH', query: '1' })}>
          Search for something
        </button>
      );
    case 'loading':
      return <div>Searching...</div>;
    case 'success':
      return <div>Success! Data: {current.context.data}</div>;
    default:
      return null;
  }
}

export default Fetcher;
