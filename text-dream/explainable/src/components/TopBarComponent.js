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
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {Typography, Toolbar, AppBar, IconButton} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';

import * as actions from '../actions';

/**
 * Providing a TopBar for the application with some controls.
 */
class TopBar extends React.Component {
  /**
   * Adds card elements to the visualization once they have been uploaded.
   *
   * @param {object} event - the event that triggers this function, containing
   * the file pointers.
   */
  addElement = (event) => {
    for (const file of event.target.files) {
      if (file) {
        const reader = new window.FileReader();
        reader.onload = (function(action) {
          return function(e) {
            action(JSON.parse(e.target.result));
          };
        })(this.props.actions.addDreamingElement);
        reader.readAsText(file);
      }
    }
  };

  /**
   * Resets the input of the fileupload so a file can be uploaded twice in a
   * row.
   *
   * @param {object} event - the event that triggers this function, normally a
   * click on the input element.
   */
  onInputClick = (event) => {
    event.target.value = '';
  }

  /**
   * Renders the top bar for the app to provide controls.
   *
   * @return {jsx} the top bar to be rendered.
   */
  render() {
    return (
      <AppBar position="fixed" color="primary">
        <Toolbar variant='dense'>
          <Typography variant="h6" color="inherit">
            What does BERT dream of?
          </Typography>
          <Typography variant='caption' color="inherit" className="appTitle">
            &nbsp;&nbsp;&nbsp;- A visual investigation of nightmares in sesame
            street by Alex Bäuerle (<a href="https://twitter.com/a13xba">
            @a13xba</a>) and James Wexler
            (<a href="https://twitter.com/bengiswex">@bengiswex</a>)
            of <a href="https://pair.withgoogle.com/">PAIR</a>.
          </Typography>
          <IconButton aria-label="github" style={{color: 'white'}}
            href="https://github.com/PAIR-code/interpretability/tree/master/text-dream">
            <GitHubIcon/>
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}

// Controls state of the Application
TopBar.propTypes = {
  actions: PropTypes.object.isRequired,
};

/**
 * Mapping the actions of redux to this component.
 *
 * @param {function} dispatch - called whenever an action is to be dispatched.
 * @return {object} all the actions bound to this component.
 */
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)};
}

export default connect(null, mapDispatchToProps)(TopBar);
