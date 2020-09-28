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
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { LinearProgress } from "@material-ui/core";

/**
 * Providing a Card Component for the TopWords chart in different experiments.
 */
class Progress extends React.Component {
  /**
   * Rendering the Progress Bar.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <LinearProgress
        variant="determinate"
        className="progress"
        value={(this.props.progress.page / this.props.progress.of) * 100}
      />
    );
  }
}

Progress.propTypes = {
  progress: PropTypes.object.isRequired,
};

/**
 * Mapping the state that this component needs to its props.
 *
 * @param {object} state - the application state from where to get needed props.
 * @param {object} ownProps - optional own properties needed to acess state.
 * @return {object} the props for this component.
 */
function mapStateToProps(state, ownProps) {
  return {
    progress: state.progress,
  };
}

export default connect(mapStateToProps)(Progress);
