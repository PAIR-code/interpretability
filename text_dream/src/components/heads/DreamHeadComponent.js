import React from 'react';
import PropTypes from 'prop-types';

import { Grid, Typography, Tooltip, Paper} from '@material-ui/core';

import ResemblingSentence from '../resembling/ResemblingSentence';

class DreamHead extends React.Component {
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
              <ResemblingSentence sentence={this.props.params.tokens}
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
  sentenceParams: PropTypes.object.isRequired
}

export default DreamHead;
