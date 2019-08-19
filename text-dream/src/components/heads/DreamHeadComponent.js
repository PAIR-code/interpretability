import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Typography, Tooltip, Paper} from '@material-ui/core';

import ReconstructSentence from '../reconstruct/ReconstructSentence';

/**
 * Providing a Heading Component for Dreaming Cards.
 */
class DreamHead extends React.Component {
  /**
   * Renders the heading component.
   *
   * @return {jsx} the heading component to be rendered.
   */
  render() {
    return (
      <Grid item>
        <Paper className='subHeadingPaper' style={{backgroundColor: '#DDDDDD'}}
          square>
          <Grid container direction='row' spacing={1} alignItems="center">
            <Tooltip title="Input Sentence" placement="top">
              <Grid item style={{width: this.props.sentenceParams.headWidth}}>
                <Typography variant="body1" color="inherit">
                  I
                </Typography>
              </Grid>
            </Tooltip>
            <Grid item>
              <ReconstructSentence
                sentence={this.props.params.tokens}
                target={this.props.sentenceParams.target}
                original={this.props.sentenceParams.target}
                colors={this.props.sentenceParams.colors}/>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    );
  }
}

DreamHead.propTypes = {
  params: PropTypes.object.isRequired,
  sentenceParams: PropTypes.object.isRequired,
};

export default DreamHead;
