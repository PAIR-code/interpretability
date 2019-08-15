import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import {Grid, Typography, IconButton, Paper} from '@material-ui/core';
import Close from '@material-ui/icons/Close';

import * as actions from '../../actions';

/**
 * Providing a Header Component for any Card.
 */
class ExplanationHead extends React.Component {
  /**
   * Function called to close the card.
   *
   * @this ExplanationHead
   */
  closeButtonClicked = () => {
    this.props.actions.removeDreamingElement(this.props.elementIndex);
  }

  /**
   * Renders the general header.
   *
   * @return {jsx} the header to be rendered.
   */
  render() {
    let keys = Object.keys(this.props.params);
    const filteredParams = {};
    for (const key of keys) {
      if (this.props.params[key] !== null) {
        filteredParams[key] = this.props.params[key];
      }
    }
    keys = Object.keys(filteredParams);
    return (
      <Grid item>
        <Paper className='headingPaper' style={{backgroundColor: '#DDDDDD'}}
          square>
          <Grid container direction='row' spacing={0} alignItems="center">
            <Grid item xs>
              <Grid container direction='row' spacing={1} alignItems="center">
                <Grid item>
                  <Typography variant="body1" color="inherit">
                    {this.props.topic}
                  </Typography>
                </Grid>
                {keys.map((key, index) =>
                  <Grid item key={index}>
                    <Typography variant="caption" color="inherit">
                      {key}: {this.props.params[key]}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid item>
              <IconButton
                color="inherit"
                onClick={this.closeButtonClicked}>
                <Close />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

ExplanationHead.propTypes = {
  topic: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired,
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
  };
}

/**
 * Mapping the actions of redux to this component.
 *
 * @param {function} dispatch - called whenever an action is to be dispatched.
 * @return {object} all the actions bound to this component.
 */
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)};
}

export default connect(mapStateToProps, mapDispatchToProps)(ExplanationHead);
