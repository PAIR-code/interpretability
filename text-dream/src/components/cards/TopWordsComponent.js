import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Paper} from '@material-ui/core';

import ExplanationHead from '../heads/ExplanationHeadComponent';
import TopWordsHead from '../heads/TopWordsHeadComponent';
import TopWordsBody from '../bodies/TopWordsBodyComponent';

/**
 * Providing a Card Component for the TopWords chart in different experiments.
 */
class TopWords extends React.PureComponent {
  /**
   * Rendering the chart card.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    const headParams = {
      'WordID': this.props.dreamingElement.word_id,
    };
    const maxIterations = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iterations.length -1].number;
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic="Top Words"
          params={headParams}
          elementIndex={this.props.elementIndex}/>
        <TopWordsHead
          maxIterations={maxIterations}
          dreamingElement={this.props.dreamingElement}
          elementIndex={this.props.elementIndex}/>
        <Grid item xs>
          <Paper id='topWordsPaper' className={'dreamPaper fullHeight'}>
            <TopWordsBody
              dreamingElement={this.props.dreamingElement}
              elementIndex={this.props.elementIndex}/>
            Activation: {this.props.dreamingElement.iterations[
                this.props.dreamingElement.iteration].activation}
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

TopWords.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default TopWords;
