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
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import {getColor} from '../../../colors';

const margin = {top: 50, right: 40, bottom: 60, left: 100};

/**
 * Component that provides a body for the TopWords Card.
 */
class TopWordsBody extends React.Component {
  /**
   * When the component first mounts, draw the initial chart.
   */
  componentDidMount() {
    this.drawGraph();
  }

  /**
   * Whenever the props of the component update, also update the chart.
   *
   * @param {object} prevProps - props before the change.
   */
  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.cardDimensions) !==
      JSON.stringify(prevProps.cardDimensions)) {
      this.drawGraph();
    } else {
      this.updateGraph();
    }
  }

  /**
   * Setup all the params that are needed for drawing the graph.
   *
   * @return {object} parameters that are needed to draw or update the graph.
   */
  setupGraphParams() {
    // Calculate the dimensions of the chart
    const sideSubstitute = 20 + margin.right + margin.left;
    const vertSubstitute = 170 + margin.top + margin.bottom;
    const width = this.props.cardDimensions.width > sideSubstitute ?
      this.props.cardDimensions.width - sideSubstitute : 20;
    const height = this.props.cardDimensions.height > vertSubstitute ?
      this.props.cardDimensions.height - vertSubstitute : 20;
    // Check if the current iteration value is valid
    const iteration = this.props.iteration;
    // Get the current selected iteration results
    const currentResults = this.props.dreamingElement.iterations[iteration];
    // Set up the scales and axes
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const yScale = d3.scaleBand()
        .range([0, height])
        .padding(0.1)
        .domain(currentResults.tokens.map(function(d) {
          return d;
        }));
    const yAxis = d3.axisLeft(yScale);
    const svg = d3.select('.topWordsComponent' + this.props.elementIndex);
    return {xScale, yScale, yAxis, svg, currentResults};
  }

  /**
   * Draw the initial version of the chart at iteration 0.
   */
  drawGraph() {
    const graphParams = this.setupGraphParams();
    // Remove any old chart
    graphParams.svg.select('g').remove();
    const xAxis = d3.axisTop(graphParams.xScale);
    // The group where the chart content lives in
    const mainGroup = graphParams.svg.append('g').attr(
        'transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Add the bars to the chart
    mainGroup.selectAll('bar')
        .data(graphParams.currentResults.scores)
        .enter()
        .append('rect')
        .style('fill', getColor('distribution'))
        .attr('x', 0)
        .attr(
            'width',
            function(d) {
              return graphParams.xScale(d);
            })
        .attr(
            'y',
            function(_, i) {
              return graphParams.yScale(graphParams.currentResults.tokens[i]);
            })
        .attr('height', graphParams.yScale.bandwidth());
    // Top axis of the bar chart
    mainGroup.append('g')
        .attr('class', 'xAxis')
        .call(xAxis)
        .selectAll('text')
        .style('font', '0.875rem roboto');
    // Left axis of the bar chart
    mainGroup.append('g')
        .attr('class', 'yAxis')
        .call(graphParams.yAxis)
        .selectAll('text')
        .style('font', '0.875rem roboto');
  }

  /**
   * Method for updating the graph after the props have changed.
   */
  updateGraph() {
    const graphParams = this.setupGraphParams();
    const mainGroup = graphParams.svg.select('g');
    // select all bars on the graph, take them out, and exit the
    // previous data set. then you can add/enter the new data set
    const bars = mainGroup.selectAll('.bar').remove().exit().data(
        graphParams.currentResults.scores);
    // now actually give each rectangle the corresponding data
    bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .style('fill', getColor('softmax'))
        .attr('x', 0)
        .attr(
            'width',
            function(d) {
              return graphParams.xScale(d);
            })
        .attr(
            'y',
            function(_, i) {
              return graphParams.yScale(graphParams.currentResults.tokens[i]);
            })
        .attr('height', graphParams.yScale.bandwidth());

    mainGroup.select('.yAxis')
        .call(graphParams.yAxis)
        .selectAll('text')
        .style('font', '0.875rem roboto');
  }

  /**
   * Render the component by adding the chart.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    return (
      <svg
        width="100%"
        height="100%"
        className={'topWordsComponent' + this.props.elementIndex}/>
    );
  }
}

TopWordsBody.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
  cardDimensions: PropTypes.object.isRequired,
  iteration: PropTypes.number.isRequired,
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

export default connect(mapStateToProps)(TopWordsBody);
