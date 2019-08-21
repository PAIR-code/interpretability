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

import {Grid, Typography} from '@material-ui/core';

/**
 * Provides a component for displaying sentences in other Components.
 */
class ReconstructSentence extends React.Component {
  /**
   * Renders a component to display sentences in other components.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const words = this.props.sentence.slice(1, -1);
    const colors = [];

    for (const i in words) {
      if (words[i] === this.props.target[parseInt(i) + 1]) {
        colors.push(this.props.colors[0]);
      } else if (words[i] === this.props.original[parseInt(i) + 1]) {
        colors.push(this.props.colors[1]);
      } else {
        colors.push(this.props.colors[2]);
      }
    }

    return (
      <Grid container direction='row' spacing={1} className='mainGrid'>
        {words.map((word, index) =>
          <Grid item key={index}>
            <Typography variant="body2" style={{color: colors[index]}}>
              {word}
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  }
}

ReconstructSentence.propTypes = {
  sentence: PropTypes.array.isRequired,
  target: PropTypes.array.isRequired,
  original: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired,
};

export default ReconstructSentence;
