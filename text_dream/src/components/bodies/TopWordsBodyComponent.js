import React from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

const margin = {top: 50, right: 20, bottom: 40, left: 100};
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

/**
 * Component that provides a body for the TopWords Card.
 */
class TopWordsBody extends React.Component {
  /**
   * When the component first mounts, draw the initial chart.
   */
  componentDidMount() {
    this.drawChart();
  }

  /**
   * Whenever the props of the component update, also update the chart.
   *
   * @param {object} prevProps - props before the change.
   */
  componentDidUpdate(prevProps) {
    this.updateGraph();
  }

  /**
   * Method for updating the graph after the props have changed.
   */
  updateGraph() {
    const currentResults = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iteration];
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const yScale = d3.scaleBand()
        .range([0, height])
        .padding(0.1)
        .domain(currentResults.tokens.map(function(d) {
          return d;
        }));
    const yAxis = d3.axisLeft(yScale);
    // select all bars on the graph, take them out, and exit the
    // previous data set. then you can add/enter the new data set
    const bars = this.mainGroup.selectAll('.bar').remove().exit().data(
        currentResults.scores);
    // now actually give each rectangle the corresponding data
    bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .style('fill', 'steelblue')
        .attr('x', 0)
        .attr(
            'width',
            function(d) {
              return xScale(d);
            })
        .attr(
            'y',
            function(_, i) {
              return yScale(currentResults.tokens[i]);
            })
        .attr('height', yScale.bandwidth());

    this.mainGroup.select('.yAxis')
        .call(yAxis)
        .selectAll('text');
  }

  /**
   * Render the component by adding the chart.
   *
   * @return {jsx} the component to be rendered.
   */
  render() {
    // const networkElement = document.getElementById('topWordsPaper');
    // if (networkElement != null) {
    //   console.log(networkElement.getBoundingClientRect().width);
    //   console.log(networkElement.getBoundingClientRect().height);
    // }
    return (
      <svg
        width="100%"
        height="100%"
        className={'topWordsComponent' + this.props.elementIndex}/>
    );
  }

  /**
   * Draw the initial version of the chart at iteration 0.
   */
  drawChart() {
    const svg = d3.select('.topWordsComponent' + this.props.elementIndex);
    const currentResults = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iteration];
    // Set up the scales and axes for the chart
    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const yScale = d3.scaleBand()
        .range([0, height])
        .padding(0.1)
        .domain(currentResults.tokens.map(function(d) {
          return d;
        }));
    const xAxis = d3.axisTop(xScale);
    const yAxis = d3.axisLeft(yScale);
    // The group where the chart content lives in
    this.mainGroup = svg.append('g').attr(
        'transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Add the bars to the chart
    this.mainGroup.selectAll('bar')
        .data(currentResults.scores)
        .enter()
        .append('rect')
        .style('fill', 'steelblue')
        .attr('x', 0)
        .attr(
            'width',
            function(d) {
              return xScale(d);
            })
        .attr(
            'y',
            function(_, i) {
              return yScale(currentResults.tokens[i]);
            })
        .attr('height', yScale.bandwidth());
    // Bottom axis of the bar chart
    this.mainGroup.append('g')
        .attr('class', 'xAxis')
        .call(xAxis)
        .selectAll('text');
    // Left axis of the bar chart
    this.mainGroup.append('g')
        .attr('class', 'yAxis')
        .call(yAxis)
        .selectAll('text');
  }
}

TopWordsBody.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
};

export default TopWordsBody;
