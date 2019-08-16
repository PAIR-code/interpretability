import * as React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import LegendItem from './LegendItemComponent';

/**
 * Providing a Legend to resolve the color scheme.
 */
class Legend extends React.Component {
  /**
   * Renders the legend component to resolve the used colors.
   *
   * @return {jsx} the legend to be rendered.
   */
  render() {
    // Get all unique colors of all used colors
    const colors = [];
    for (const currentColors of this.props.activeColors) {
      for (const color of currentColors) {
        if (!colors.includes(color)) {
          colors.push(color);
        }
      }
    }
    colors.sort();
    return (
      <div className='legend'>
        {colors.map((element, index) =>
          <LegendItem color={element} key={index}/>
        )}
      </div>
    );
  }
}

// Controls state of the Application
Legend.propTypes = {
  activeColors: PropTypes.array.isRequired,
};

/**
 * Mapping the state that this component needs to its props.
 *
 * @param {object} state - the application state from where to get needed props.
 * @param {object} ownProps - optional own properties needed to acess state.
 * @return {object} the props for this component.
 */
function mapStateToProps(state, ownProps) {
  return {
    activeColors: state.activeColors,
  };
}

export default connect(mapStateToProps)(Legend);
