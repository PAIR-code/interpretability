import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

import './styles/index.css';

// Render the Application into the html 'root' element
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
