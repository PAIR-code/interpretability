import React from "react";
import PropTypes from "prop-types";

import { Grid, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import NavigateNext from "@material-ui/icons/NavigateNext";
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
          <Link to={this.props.prev}>
            <Button
              variant="contained"
              color="secondary"
              endIcon={<NavigateBefore />}
            >
              Back
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to={this.props.next}>
            <Button
              variant="contained"
              color="secondary"
              endIcon={<NavigateNext />}
            >
              Next
            </Button>
          </Link>
        </Grid>
      </Grid>
    );
  }
}

BothButtons.propTypes = {
  prev: PropTypes.string.isRequired,
  next: PropTypes.string.isRequired,
};

export default BothButtons;
