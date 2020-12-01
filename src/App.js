import React from 'react';
import './App.css';

import World from './components/world';

function App() {
  return (
    <div className="App">
      <World cols={ 42 } rows={ 300 } />
    </div>
  );
}

export default App;
