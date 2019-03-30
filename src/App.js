import React from 'react';

import Toggler from './Toggler.jsx';
import Fetcher from './Fetcher.jsx';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Toggler />
        <Fetcher onResolve={value => console.log('succeeded', value)} />
      </div>
    );
  }
}

export default App;
