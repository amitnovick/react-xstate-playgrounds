import React from 'react';
import { useMachine } from '@xstate/react';
import { Machine, assign } from 'xstate';
import axios from 'axios';

const RESPONSE_NOT_OK = 'notOK';
const CLIENT_DISCONNECTED = 'clientDisconnected';

const URL = 'https://jsonplaceholder.typicode.com/todos';
const fetchUser = query =>
  axios
    .get(`${URL}/${query}`)
    .then(res => {
      const { data } = res;
      return data;
    })
    .catch(error => {
      if (error.response) {
        throw new Error(RESPONSE_NOT_OK);
      } else {
        throw new Error(CLIENT_DISCONNECTED);
      }
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
          src: (ctx, event) => fetchUser(event.query),
          onDone: {
            target: 'success',
            actions: assign({
              user: (_, event) => event.data
            })
          },
          onError: {
            target: 'failure',
            actions: assign({ error: (ctx, event) => event.data.message })
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

function Fetcher({ query }) {
  const [current, send] = useMachine(fetchMachine);

  switch (current.value) {
    case 'idle':
      return (
        <button onClick={() => send({ type: 'FETCH', query: query })}>
          Search for something
        </button>
      );
    case 'loading':
      return <div>Searching...</div>;
    case 'success':
      return <div>Success! Data: {JSON.stringify(current.context.user)}</div>;
    case 'failure':
      const errorType = current.context.error;
      switch (errorType) {
        case RESPONSE_NOT_OK:
          return <div>Failed. service is unavailable.</div>;
        case CLIENT_DISCONNECTED:
          return <div>Failed. please reconnect and try again. </div>;
        default:
          return null;
      }
    default:
      return null;
  }
}

function Parent() {
  const [query, setQuery] = React.useState('');
  return (
    <div>
      <input value={query} onChange={event => setQuery(event.target.value)} />
      <Fetcher query={query} />
    </div>
  );
}

export default Parent;
