import React from 'react';
import PropTypes from 'prop-types';

class GlyphComponent extends React.Component {
  render() {
    var glyphWidth = 10;
    var glyphHeight = 20;
    var extremeDiff = this.props.extremes.max - this.props.extremes.min;
    var yPos = glyphHeight * (1 - ((this.props.value - this.props.extremes.min)
        / extremeDiff));
    var varPath = "M 0 " + glyphHeight + " H " + glyphWidth + " V " + (yPos) + " H " + (-glyphWidth) + " Z";
    var leftPath = "M 0 0 V " + glyphHeight;
    return (
      <svg width={glyphWidth} height={glyphHeight} id='glyphsSVG'>
        <g>
          <path d={varPath} stroke={this.props.color} fill={this.props.color}/>
          <path d={leftPath} stroke="black" />
        </g>
      </svg>
    )
  }
}

GlyphComponent.propTypes = {
  value: PropTypes.number.isRequired,
  extremes: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired
}

export default GlyphComponent;
