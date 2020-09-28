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
import { bindActionCreators } from "redux";
import { Grid } from "@material-ui/core";
import getViewData from "../data/ViewData";

import * as actions from "../actions";

/**
 * Displaying the view for the current step in the explainable.
 */
class ViewStep extends React.Component {
  /**
   * Updating the page progress.
   */
  componentDidMount() {
    this.props.actions.changeProgressPage(this.props.index + 1);
  }

  /**
   * Renders the main component containing all the cards.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    let content = getViewData(this.props.index);
    return (
      <Grid
        container
        alignItems="center"
        spacing={2}
        className="fullHeight"
        justify="center"
      >
        <Grid
          item
          xs={6}
          container
          direction="column"
          spacing={2}
          className="fullHeight"
          justify="center"
          wrap="nowrap"
        >
          {content.heading}
          {content.texts}
          {content.buttons}
        </Grid>
        {content.illustration}
      </Grid>
    );
  }
}

ViewStep.propTypes = {
  actions: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * Mapping the actions of redux to this component.
 *
 * @param {function} dispatch - called whenever an action is to be dispatched.
 * @return {object} all the actions bound to this component.
 */
function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(actions, dispatch) };
}

export default connect(null, mapDispatchToProps)(ViewStep);
