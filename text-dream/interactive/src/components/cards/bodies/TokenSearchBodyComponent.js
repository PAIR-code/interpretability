/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
*/
import React from 'react';
import {connect} from 'react-redux'; import PropTypes from 'prop-types';

import * as d3 from 'd3';
import {getColor} from '../../../colors';

const margin = {top: 20, right: 20, bottom: 60, left: 100};

/**
 * Provides a Body Component for the Similar Embeddings Card.
 */
class TokenSearchBodyComponent extends React.Component {
  /**
   * Draws the chart once the component has mounted.
   */
  componentDidMount() {
    this.drawGraph();
  }

  /**
   * When this component updates, probably the dimensions have changed,
   * therefore, redraw the chart.
   */
  componentDidUpdate() {
    this.drawGraph();
  }

  /**
   * Renders the component.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <svg
        width="100%"
        height="100%"
        className={'tokenSearchComponent' + this.props.elementIndex}/>
    );
  }

  /**
   * Draw the chart into the svg.
   */
  drawGraph() {
    // Calculate the dimensions of the chart
    const sideSubstitute = 20 + margin.right + margin.left;
    const vertSubstitute = 120 + margin.top + margin.bottom;
    const width = this.props.cardDimensions.width > sideSubstitute ?
      this.props.cardDimensions.width - sideSubstitute : 20;
    const height = this.props.cardDimensions.height > vertSubstitute ?
      this.props.cardDimensions.height - vertSubstitute : 20;
    const svg = d3.select('.tokenSearchComponent' + this.props.elementIndex);
    // Remove any old chart
    svg.select('g').remove();
    // Set up the scales and axes for the chart
    let tops = this.props.dreamingElement.tops;
    if (tops.length > 30) {
      tops = tops.slice(0, 30);
    }
    const maxActivation = tops[0].activation;
    let minActivation = 0;
    for (const top of tops) {
      minActivation = top.activation < minActivation ? top.activation :
          minActivation;
    }
    const xScaleActivation = d3.scaleLinear().domain([minActivation,
      maxActivation]).range([0, width]);
    const yScale = d3.scaleBand()
        .range([0, height])
        .padding(0.1)
        .domain(tops.map(function(d) {
          return d.token;
        }));
    const yAxis = d3.axisLeft(yScale);
    // The group where the chart content lives in
    const mainGroup = svg.append('g').attr(
        'transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Add the activation bars to the chart
    mainGroup.selectAll('bar')
        .data(tops)
        .enter()
        .append('rect')
        .style('fill', getColor('activation'))
        .attr('x', 0)
        .attr(
            'width',
            function(d) {
              return xScaleActivation(d.activation);
            })
        .attr(
            'y',
            function(d) {
              return yScale(d.token);
            })
        .attr('height', yScale.bandwidth());
    // Add a label to each of the bars
    mainGroup.selectAll('text')
        .data(tops)
        .enter()
        .append('text')
        .style('font', '10px roboto')
        .attr('y', function(d) {
          return yScale(d.token) + yScale.bandwidth() / 2 + 5;
        })
        .attr('x', function(d) {
          return 3;
        })
        .text(function(d) {
          return d.activation.toFixed(4);
        });
    // Left axis of the bar chart
    mainGroup.append('g')
        .attr('class', 'yAxis')
        .style('font', '10px roboto')
        .call(yAxis)
        .selectAll('text');
  }
}

TokenSearchBodyComponent.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
  cardDimensions: PropTypes.object.isRequired,
  colors: PropTypes.array.isRequired,
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
    cardDimensions: state.cardDimensions,
  };
}

export default connect(mapStateToProps)(TokenSearchBodyComponent);

