import React from 'react';
import PropTypes from 'prop-types';

import { Grid, Typography, Tooltip } from '@material-ui/core';

import ResemblingSentence from '../resembling/ResemblingSentence';
import GlyphComponent from '../glyph/GlyphComponent';

import * as glyphs from '../../glyphs'

class ShiftedResemblingBody extends React.Component {
  render() {
    var iterations = this.props.results.iterations;
    var glyphsParams = glyphs.iterationsToGlyphsParams(iterations);
    return (
      <Grid container direction='column' spacing={2} wrap='nowrap'>
        {iterations.map((iteration, index) =>
          <Grid item key={index}>
            <Grid container direction='row' spacing={1}>
              <Tooltip title="Iteration Number" placement="top">
                <Grid item style={{width: this.props.sentenceParams.itWidth}}>
                  <Typography variant="caption" color="inherit">
                    {iteration.number}
                  </Typography>
                </Grid>
              </Tooltip>
              <Grid item>
                <Grid container direction='row' spacing={0}>
                  {Object.keys(glyphsParams).map((key, idx) =>
                    <Tooltip
                        title={key + ": " +
                            glyphsParams[key].iterations[
                                index].toFixed(4)}
                        placement="top" key={idx}>
                      <Grid item>
                        <GlyphComponent
                            value={glyphsParams[key].iterations[index]}
                            extremes={glyphsParams[key].extremes}
                            color={glyphsParams[key].color}/>
                      </Grid>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
              <Grid item>
                <ResemblingSentence
                  sentence={iteration.tokens}
                  target={this.props.sentenceParams.target}
                  original={this.props.params.tokens}
                  colors={this.props.sentenceParams.colors}/>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  }
}

ShiftedResemblingBody.propTypes = {
  results: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  sentenceParams: PropTypes.object.isRequired
}

export default ShiftedResemblingBody;
