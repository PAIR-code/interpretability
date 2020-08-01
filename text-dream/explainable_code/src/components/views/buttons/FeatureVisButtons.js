import React from 'react';

import {Grid, Button} from '@material-ui/core';
import {Link} from 'react-router-dom';
import NavigateNext from '@material-ui/icons/NavigateNext';

/**
 * Displaying the buttons for this step in the explainable.
 */
class FeatureVisButtons extends React.Component {
  /**
   * Renders the buttons.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item container direction='row' justify='center' spacing={2}>
        <Grid item>
          <Link to='/textspecial'>
            <Button variant='contained' color='secondary'
              endIcon={<NavigateNext/>}>
              Start Exploring
            </Button>
          </Link>
        </Grid>
      </Grid>
    );
  }
}

export default FeatureVisButtons;
