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
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {CSSTransition} from 'react-transition-group';
import {Grid} from '@material-ui/core';

import TopBar from './components/TopBarComponent';
import Progress from './components/ProgressComponent';
import FeatureVis from './components/views/FeatureVisComponent';
import TextSpecial from './components/views/TextSpecialityComponnent';
import BERTResults from './components/views/BERTResultsComponent';
import DreamVis from './components/views/DreamVisComponent';
import AnnealingVis from './components/views/AnnealingVisComponent';
import TopWordsVis from './components/views/TopWordsVisComponent';
import SimilarVis from './components/views/SimilarVisComponent';
import ReconstructVis from './components/views/ReconstructVisComponent';
import ShiftVis from './components/views/ShiftVisComponent';
import ConclusionVis from './components/views/ConclusionVisComponent';

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
        <Router basename="/interpretability/text-dream/interactive">
          <header>
            <TopBar/>
          </header>
          <Grid container direction='column' className='fullHeight'>
            <Progress />
            <Grid item xs className='fullHeight'>
              <div className='full'>
                <Route exact path="/">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <FeatureVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/featurevis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <FeatureVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/textspecial">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <TextSpecial />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/bertresults">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <BERTResults />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/dreamvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <DreamVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/annealingvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <AnnealingVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/topvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <TopWordsVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/similarvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <SimilarVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/reconstructvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <ReconstructVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/shiftvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <ShiftVis />
                    </CSSTransition>
                  )}
                </Route>
                <Route exact path="/conclusionvis">
                  {({match}) => (
                    <CSSTransition
                      in={match != null}
                      timeout={300}
                      classNames="page"
                      unmountOnExit
                    >
                      <ConclusionVis />
                    </CSSTransition>
                  )}
                </Route>
              </div>
            </Grid>
          </Grid>
        </Router>
      </div>
    );
  }
}

export default AppRouter;

