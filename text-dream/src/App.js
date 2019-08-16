import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import CssBaseline from '@material-ui/core/CssBaseline';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import {blue, red, grey} from '@material-ui/core/colors';

import AppRouter from './AppRouter';
import TopBar from './components/TopBarComponent';

import combinedReducers from './reducers';

// Create the Store using all the Reducers and applying the Middleware
const store = createStore(
    combinedReducers,
    applyMiddleware(thunk)
);

// Application color theme
const theme = createMuiTheme({
  palette: {
    primary: {light: grey[300], main: grey[900], dark: grey[700]},
    secondary: {light: red[300], main: red[500], dark: red[700]},
  },
  typography: {
    useNextVariants: true,
  },
});

// Render the App
// The App provides the Store to the following components.
// Controls as well as Routed Content are rendered.
const App = () => (
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <CssBaseline />
      <header>
        <TopBar/>
      </header>
      <AppRouter />
    </Provider>
  </MuiThemeProvider>
);

export default App;
