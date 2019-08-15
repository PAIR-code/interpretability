import React from 'react';
import PropTypes from 'prop-types';

import {Grid, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails,
  Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ResemblingSentence from '../resembling/ResemblingSentence';
import ExplanationHead from '../heads/ExplanationHeadComponent';

import {getDreamProps, getResembleProps,
  getMagnitudesLayerProps} from '../../cardcontentprocessing';

/**
 * Provides a Card Component to render multiple Layers.
 */
class Layers extends React.Component {
  /**
   * Renders all the layers of this Card.
   *
   * @return {jsx} the card with the layers to be rendered
   */
  render() {
    let props;
    switch (this.props.layers[0].type) {
      case 'dream':
        props = getDreamProps(this.props.layers);
        break;
      case 'resemble':
        props = getResembleProps(this.props.layers);
        break;
      case 'magnitudes':
        props = getMagnitudesLayerProps(this.props.layers);
        break;
      default:
        break;
    }
    props.sentenceParams.headWidth = props.sentenceParams.headWidth + 14;
    return (
      <Grid container direction='column' className='fullHeight' wrap='nowrap'>
        <ExplanationHead
          topic={props.topic}
          params={props.headParams}
          elementIndex={this.props.elementIndex}/>
        {props.head}
        <div className='overflow'>
          {props.bodies.map((body, index) =>
            <ExpansionPanel key={index}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container direction='row' spacing={1} alignItems="center">
                  <Grid item style={{width: props.sentenceParams.headWidth}}>
                    <Typography variant="body1" color="inherit">
                      {props.layerIDs[index]}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <ResemblingSentence
                      sentence={props.sentences[index]}
                      target={props.sentenceParams.target}
                      original={props.sentenceParams.original}
                      colors={props.sentenceParams.colors}/>
                  </Grid>
                </Grid>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                {body}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )}
        </div>
      </Grid>
    );
  }
}

Layers.propTypes = {
  layers: PropTypes.array.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default Layers;
