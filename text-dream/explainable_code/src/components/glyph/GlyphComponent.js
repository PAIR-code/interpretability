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

/**
 * Providing a Component representing a small glyph used for activation/loss/...
 * visualization.
 */
class GlyphComponent extends React.Component {
  /**
   * Renders the glyph component.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const glyphWidth = 10;
    const glyphHeight = 20;
    const extremeDiff = this.props.extremes.max - this.props.extremes.min;
    const yPos = glyphHeight * (1 - ((this.props.value -
        this.props.extremes.min) / extremeDiff));
    const varPath = 'M 0 ' + glyphHeight + ' H ' + glyphWidth + ' V ' +
        (yPos) + ' H ' + (-glyphWidth) + ' Z';
    const leftPath = 'M 0 0 V ' + glyphHeight;
    return (
      <svg width={glyphWidth} height={glyphHeight} id='glyphsSVG'>
        <g>
          <path d={varPath} stroke={this.props.color} fill={this.props.color}/>
          <path d={leftPath} stroke="black" />
        </g>
      </svg>
    );
  }
}

GlyphComponent.propTypes = {
  value: PropTypes.number.isRequired,
  extremes: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
};

export default GlyphComponent;
