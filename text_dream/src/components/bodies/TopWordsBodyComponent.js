import React from 'react';
import PropTypes from 'prop-types';

import * as d3 from "d3";

const margin = {top: 50, right: 20, bottom: 40, left: 100};
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
var yScale;
var xScale;
var mainGroup;

class TopWordsBody extends React.Component {
  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate(prevProps) {
    this.updateGraph();
  }

  updateGraph() {
    let currentResults = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iteration];
    yScale.domain(currentResults.tokens.map(function(d) {
      return d;
    }));
    let yAxis = d3.axisLeft(yScale);

    // select all bars on the graph, take them out, and exit the
    // previous data set. then you can add/enter the new data set
    var bars = mainGroup.selectAll('.bar').remove().exit().data(
      currentResults.scores)

    // now actually give each rectangle the corresponding data
    bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .style('fill', 'steelblue')
        .attr('x', 0)
        .attr(
            'width',
            function(d) {
              return xScale(d)
            })
        .attr(
            'y',
            function(_, i) {
              return yScale(currentResults.tokens[i]);
            })
        .attr('height', yScale.bandwidth());

    mainGroup.select('.yAxis')
      .call(yAxis)
      .selectAll('text');
  }

  render() {
    var networkElement = document.getElementById('topWordsPaper');
    if (networkElement != null) {
      console.log(networkElement.getBoundingClientRect().width);
      console.log(networkElement.getBoundingClientRect().height);
    }

    return(
      <svg width="100%" height="100%" id='topWordsSVG'
          className='topWordsComponent'/>
    )
  }

  drawChart() {
    const svg = d3.select('.topWordsComponent');
    const currentResults = this.props.dreamingElement.iterations[
        this.props.dreamingElement.iteration];

    // Set up the scales and axes for the chart
    xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    yScale = d3.scaleBand()
      .range([0, height])
      .padding(0.1)
      .domain(currentResults.tokens.map(function(d) {
        return d;
      }));
    let xAxis = d3.axisTop(xScale);
    let yAxis = d3.axisLeft(yScale);

    // The group where the chart content lives in
    mainGroup = svg.append('g').attr(
        'transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Add the bars to the chart
    mainGroup.selectAll('bar')
      .data(currentResults.scores)
      .enter()
      .append('rect')
      .style('fill', 'steelblue')
      .attr('x', 0)
      .attr(
          'width',
          function(d) {
            return xScale(d)
          })
      .attr(
          'y',
          function(_, i) { return yScale(currentResults.tokens[i]); })
      .attr('height', yScale.bandwidth());

    // Bottom axis of the bar chart
    mainGroup.append('g')
      .attr('class', 'xAxis')
      .call(xAxis)
      .selectAll('text');

    // Left axis of the bar chart
    mainGroup.append('g')
      .attr('class', 'yAxis')
      .call(yAxis)
      .selectAll('text');
  }
}

TopWordsBody.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
}

export default TopWordsBody;
