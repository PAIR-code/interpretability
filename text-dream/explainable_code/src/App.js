/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import React from "react";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

import AppRouter from "./AppRouter";
import combinedReducers from "./reducers";

// Create the Store using all the Reducers and applying the Middleware
const store = createStore(combinedReducers, applyMiddleware(thunk));

// Application color theme
const theme = createMuiTheme({
  palette: {
    primary: { light: grey[300], main: grey[900], dark: grey[700] },
    secondary: {
      light: "rgba(255, 179, 68, 0.1)",
      main: "rgba(255, 179, 68, 0.2)",
      dark: "rgba(255, 179, 68, 0.6)",
    },
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
      <AppRouter />
    </Provider>
  </MuiThemeProvider>
);

export default App;
