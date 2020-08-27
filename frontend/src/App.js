import React from 'react';
import './App.css';
import Loading from './components/Loading';
import HomePage from './components/HomePage';
import Karaoke from './components/Karaoke';
import {
  Switch,
  Route
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Switch>
          <Route path="/loading" component={Loading} />
          <Route path="/karaoke" component={Karaoke} />
          <Route path="/" component={HomePage} />
        </Switch>
      </header>
    </div>
  );
}

export default App;
