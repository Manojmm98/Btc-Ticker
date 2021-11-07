import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './css/bootstrap-3.3.7-dist/css/bootstrap.min.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If we want  to work  with offline mode with fast speed, we  can change
// unregister() to register() below. 
serviceWorker.unregister();
