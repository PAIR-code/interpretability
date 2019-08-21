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
import * as React from 'react';
import {HashRouter as Router, Route} from 'react-router-dom';
import Main from './components/MainComponent';

/**
 * AppRouter Calling other Components dependant on Route
 */
class AppRouter extends React.Component {
  /**
   * Rendering component dependant on route.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <div className='content'>
        <Router>
          <div className='full'>
            <Route exact={true} path="/"
              render={() => <Main />}
            />
          </div>
        </Router>
      </div>
    );
  }
}

export default AppRouter;
