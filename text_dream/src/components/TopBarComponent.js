import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import { Typography, Toolbar, AppBar, IconButton } from '@material-ui/core';
import Add from '@material-ui/icons/Add';

import * as actions from '../actions';

// Controls at top of the Application
class TopBar extends React.Component {
  addElement = (event) => {
    var file = event.target.files[0]
    if (file) {
      var reader = new FileReader();
      reader.onload = (function(action) {
        return function(e) {
          action(JSON.parse(e.target.result))
        };
      })(this.props.actions.addDreamingElement);
      reader.readAsText(file);
    }
  };

  onInputClick = (event) => {
    event.target.value = '';
  }

  render() {
    return(
      <AppBar position="fixed" color="primary">
        <Toolbar variant='dense'>
          <Typography variant="h6" color="inherit" className="appTitle">
            TextDreams
          </Typography>
          <input
              accept="text/json"
              className="hiddenInput"
              id="icon-button-file"
              type="file"
              onChange={this.addElement}
              onClick={this.onInputClick}/>
            <label htmlFor="icon-button-file">
              <IconButton
                  aria-label="add card"
                  component="span"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit">
                <Add />
              </IconButton>
            </label>
        </Toolbar>
      </AppBar>
    );
  }
}

// Controls state of the Application
TopBar.propTypes = {
};

// Mapping the Controls state to the Props of this Class
function mapStateToProps(state, _) {
  return {
  };
}

// Map the Actions called when Controls are used to the Props of this Class
function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
