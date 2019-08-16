import * as React from 'react';
import PropTypes from 'prop-types';

import {Typography} from '@material-ui/core';

import {getColor} from '../../colors';

/**
 * Providing a Legend to resolve the color scheme.
 */
class LegendItem extends React.Component {
  /**
   * Renders the legend component to resolve the used colors.
   *
   * @return {jsx} the legend to be rendered.
   */
  render() {
    return (
      <div className='legend' style={{paddingRight: '15px'}}>
        <svg width={10} height={10} id='glyphsSVG' style={{marginRight: '5px'}}>
          <rect width="10" height="10" fill={getColor(this.props.color)} />
        </svg>
        <Typography variant="body2" color="inherit">
          {this.props.color}
        </Typography>
      </div>
    );
  }
}

// Controls state of the Application
LegendItem.propTypes = {
  color: PropTypes.string.isRequired,
};

export default LegendItem;
