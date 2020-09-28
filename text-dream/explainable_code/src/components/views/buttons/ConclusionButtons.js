import React from "react";

import { Grid, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import NavigateBefore from "@material-ui/icons/NavigateBefore";

/**
 * Displaying the buttons for this step in the explainable.
 */
class BothButtons extends React.Component {
  /**
   * Renders the buttons.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <Grid item container direction="row" justify="center" spacing={2}>
        <Grid item>
          <Link to="/shiftvis">
            <Button
              variant="contained"
              color="secondary"
              endIcon={<NavigateBefore />}
            >
              Back
            </Button>
          </Link>
        </Grid>
      </Grid>
    );
  }
}

export default BothButtons;
