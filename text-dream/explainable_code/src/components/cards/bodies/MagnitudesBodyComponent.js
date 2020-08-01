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
import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Typography, Tooltip} from '@material-ui/core';

import ReconstructSentence from '../../reconstruct/ReconstructSentence';
import GlyphComponent from '../../glyph/GlyphComponent';

import * as glyphs from '../../../glyphs';

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
                <ReconstructSentence
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
