import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Typography, Tooltip, Paper} from '@material-ui/core';

import ReconstructSentence from '../reconstruct/ReconstructSentence';

/**
 * Providing a header component for Reconstruct experiments.
 */
class ReconstructHead extends React.Component {
  /**
   * Rendering the Reconstruct header.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item>
        <Paper className='subHeadingPaper' style={{backgroundColor: '#DDDDDD'}}
          square>
          <Grid container direction='row' spacing={1} alignItems="center">
            <Tooltip title="Reconstruct Target" placement="top">
              <Grid item style={{width: this.props.sentenceParams.headWidth}}>
                <Typography variant="body1" color="inherit">
                  T
                </Typography>
              </Grid>
            </Tooltip>
            <Grid item>
              <ReconstructSentence
                sentence={this.props.params.tokens}
                target={this.props.sentenceParams.target}
                original={this.props.params.tokens}
                colors={this.props.sentenceParams.colors}/>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

ReconstructHead.propTypes = {
  params: PropTypes.object.isRequired,
  sentenceParams: PropTypes.object.isRequired,
};

export default ReconstructHead;
