import React from 'react';
import PropTypes from 'prop-types';

import * as d3 from "d3";

const margin = {top: 50, right: 20, bottom: 40, left: 100};
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

class SimilarEmbeddingsBodyComponent extends React.Component {
  componentDidMount() {
    this.drawChart();
  }

  render() {
    var networkElement = document.getElementById('topWordsPaper');
    if (networkElement != null) {
      console.log(networkElement.getBoundingClientRect().width);
      console.log(networkElement.getBoundingClientRect().height);
    }
    return(
      <svg
          width="100%"
          height="100%"
          className={'similarEmbeddingsComponent' + this.props.elementIndex}/>
    )
  }

  drawChart() {
    const svg = d3.select('.similarEmbeddingsComponent' +
        this.props.elementIndex);
    // Set up the scales and axes for the chart
    var maxActivation = 0;
    var maxDistance = 0;
    console.log(this.props.dreamingElement.tops[0])
    //var xScaleActivation = d3.scaleLinear().domain([0, 1]).range([0, width]);
    //var xScaleDistance = d3.scaleLinear().domain([0, 1]).range([0, width]);
    //var yScale = d3.scaleBand()
    //  .range([0, height])
    //  .padding(0.1)
    //  .domain(currentResults.tokens.map(function(d) {
    //    return d;
    //  }));
    //let xAxis = d3.axisTop(xScale);
    //let yAxis = d3.axisLeft(yScale);
    //// The group where the chart content lives in
    //this.mainGroup = svg.append('g').attr(
    //    'transform', 'translate(' + margin.left + ',' + margin.top + ')');
    //// Add the bars to the chart
    //this.mainGroup.selectAll('bar')
    //  .data(currentResults.scores)
    //  .enter()
    //  .append('rect')
    //  .style('fill', 'steelblue')
    //  .attr('x', 0)
    //  .attr(
    //      'width',
    //      function(d) {
    //        return xScale(d)
    //      })
    //  .attr(
    //      'y',
    //      function(_, i) { return yScale(currentResults.tokens[i]); })
    //  .attr('height', yScale.bandwidth());
    //// Bottom axis of the bar chart
    //this.mainGroup.append('g')
    //  .attr('class', 'xAxis')
    //  .call(xAxis)
    //  .selectAll('text');
    //// Left axis of the bar chart
    //this.mainGroup.append('g')
    //  .attr('class', 'yAxis')
    //  .call(yAxis)
    //  .selectAll('text');
  }
}

SimilarEmbeddingsBodyComponent.propTypes = {
  dreamingElement: PropTypes.object.isRequired,
  elementIndex: PropTypes.number.isRequired,
}

export default SimilarEmbeddingsBodyComponent;
