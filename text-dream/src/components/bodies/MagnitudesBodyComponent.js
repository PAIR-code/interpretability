import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Typography, Tooltip} from '@material-ui/core';

import ResemblingSentence from '../resembling/ResemblingSentence';
import GlyphComponent from '../glyph/GlyphComponent';

import * as glyphs from '../../glyphs';

/**
 * Provides a Body Component for the Megnitudes Card.
 */
class MagnitudesBody extends React.Component {
  /**
   * Renders the component.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const magnitudes = this.props.magnitudes;
    magnitudes.sort(function(a, b) {
      return a.params.shift_magnitude - b.params.shift_magnitude;
    });
    const glyphsParams = glyphs.magnitudesToGlyphsParams(magnitudes);
    return (
      <Grid container direction='column' spacing={2} wrap='nowrap'>
        {magnitudes.map((magnitude, index) =>
          <Grid item key={index}>
            <Grid container direction='row' spacing={1}>
              <Tooltip title="Shift Magnitude" placement="top">
                <Grid item style={{width: this.props.sentenceParams.itWidth}}>
                  <Typography variant="caption" color="inherit">
                    {magnitude.params.shift_magnitude}
                  </Typography>
                </Grid>
              </Tooltip>
              <Grid item>
                <Grid container direction='row' spacing={0}>
                  {Object.keys(glyphsParams).map((key, idx) =>
                    <Tooltip
                      title={key + ': ' +
                          glyphsParams[key].magnitudes[
                              index].toFixed(4)}
                      placement="top" key={idx}>
                      <Grid item>
                        <GlyphComponent
                          value={glyphsParams[key].magnitudes[index]}
                          extremes={glyphsParams[key].extremes}
                          color={glyphsParams[key].color}/>
                      </Grid>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
              <Grid item>
                <ResemblingSentence
                  sentence={magnitude.results.iterations[
                      magnitude.results.iterations.length - 1].tokens}
                  target={this.props.sentenceParams.target}
                  original={magnitude.params.tokens}
                  colors={this.props.sentenceParams.colors}/>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  }
}

MagnitudesBody.propTypes = {
  magnitudes: PropTypes.array.isRequired,
  sentenceParams: PropTypes.object.isRequired,
};

export default MagnitudesBody;
