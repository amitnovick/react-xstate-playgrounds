import React from 'react';
import { useMachine } from '@xstate/react';
import { Machine } from 'xstate';
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

const fetchMachine = Machine({
  id: 'fetch',
  initial: 'idle',
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      on: { FETCH_SUCCEEDED: 'success', FETCH_FAILED: 'failure' }
    },
    success: {
      type: 'final'
    },
    failure: {
      type: 'final'
    }
  }
});

function Fetcher({ query }) {
  const [current, send] = useMachine(fetchMachine);

  const onButtonClick = query => {
    send({ type: 'FETCH' });
    return fetchUser(query)
      .then(data => send({ type: 'FETCH_SUCCEEDED', outcome: 'success' }))
      .catch(error => send({ type: 'FETCH_FAILED', outcome: 'failure' }));
  };

  switch (current.value) {
    case 'idle':
      return (
        <button onClick={() => onButtonClick(query)}>
          Search for something
        </button>
      );
    case 'loading':
      return <div>Searching...</div>;
    case 'success':
      return <div>Success!</div>;
    case 'failure':
      return <div>Failed. :-(</div>;
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
