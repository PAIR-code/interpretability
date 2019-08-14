import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import { Grid } from '@material-ui/core';

import * as actions from '../actions'
import CardComponent from './CardComponent';

class Main extends React.Component {
  render() {
    return (
      <Grid container direction='row' spacing={1} className='fullHeight'>
        <Grid item xs className='fullHeight'>
          <Grid container direction='row' className='fullHeight' spacing={1}>
              {this.props.dreamingElements.map((element, index) =>
                <CardComponent
                    dreamingElement={element}
                    elementIndex={index}
                    key={index}/>
              )}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Main.propTypes = {
  dreamingElements: PropTypes.array.isRequired
}

function mapStateToProps(state, _) {
  return {
    dreamingElements: state.dreamingElements
  };
}

// Mapping the Actions called for SVG manipulation to the Props of this Class
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
