import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Typography, Tooltip, Paper} from '@material-ui/core';

import ResemblingSentence from '../resembling/ResemblingSentence';

/**
 * Providing a header component for shifted resembling results.
 */
class ShiftedResemblingHead extends React.Component {
  /**
   * Render the header component.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item>
        <Paper className='subHeadingPaper' style={{backgroundColor: '#DDDDDD'}}
          square>
          <Grid container direction='row' spacing={1} alignItems="center">
            <Tooltip title="Resembling Input" placement="top">
              <Grid item style={{width: this.props.sentenceParams.headWidth}}>
                <Typography variant="body1" color="inherit">
                  I
                </Typography>
              </Grid>
            </Tooltip>
            <Grid item>
              <ResemblingSentence
                sentence={this.props.params.tokens}
                target={this.props.sentenceParams.target}
                original={this.props.params.tokens}
                colors={this.props.sentenceParams.colors}/>
            </Grid>
          </Grid>
        </Paper>
        <Paper className='subHeadingPaper' style={{backgroundColor: '#DDDDDD'}}
          square>
          <Grid container direction='row' spacing={1} alignItems="center">
            <Tooltip title="Resembling Target" placement="top">
              <Grid item style={{width: this.props.sentenceParams.headWidth}}>
                <Typography variant="body1" color="inherit">
                  T
                </Typography>
              </Grid>
            </Tooltip>
            <Grid item>
              <ResemblingSentence
                sentence={this.props.sentenceParams.changedSentence}
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

ShiftedResemblingHead.propTypes = {
  params: PropTypes.object.isRequired,
  sentenceParams: PropTypes.object.isRequired,
};

export default ShiftedResemblingHead;
