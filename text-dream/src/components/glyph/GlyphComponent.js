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
