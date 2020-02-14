/* Copyright 2020 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/


console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var color = d3.scaleOrdinal(d3.schemeCategory10)

var width = innerWidth
var height = innerHeight

var isMobile = width < 430

var graphSel = d3.select('#graph').html('')
  .st({width, height})
  .st({width: '100vw', height: '100vh', overflow: 'hidden'})
  .classed('is-mobile', isMobile)

var containerSel = graphSel.append('div')
  .st({outline: '0px solid #000', position: 'relative'})

var Buildings = containerSel.append('img')
  .at({src: 'basemap/final/buildings.png'})
  .st({width: 6000, position: 'absolute'})

var Neighborhoods = containerSel.append('img')
  .at({src: 'basemap/final/outlines.png'})
  .st({width: 6000, position: 'absolute'})

// var Labels = containerSel.append('img')
//   .at({src: 'basemap/final/labels.svg'})
//   .st({width: 6000, position: 'absolute'})

var hoverSel = containerSel.append('img.hover-sel.active')
  .at({src: 'basemap/final/split/sunnyside.svg'})
  .st({width: 6000, position: 'absolute'})

var Labels = containerSel.append('div')
  .st({width: 6000, position: 'absolute'})
  
d3.text('basemap/final/labels.svg', (err, res) => {
  Labels.append('div').html(res)

  var textSel = Labels.selectAll('text')
    .each(function(){
      var sel = d3.select(this)
      var color = sel.attr('fill')
      var darkColor = d3.color(color).darker(.7)

      sel.at({fill: darkColor})

      sel.datum({sel, color, darkColor, file: sel.attr('class')})
    })
    .on('mouseover', d => {
      hoverSel
        .at({src: 'basemap/final/split/' + d.file + '.svg'})
        .classed('active', 1)
      // Neighborhoods.st({opacity: })
    })
    .on('mouseout', d => {
      hoverSel
        .at({src: ''})
        .classed('active', 0)
    })

  Labels.selectAll('#neighborhoods-centroids1 text')
    .st({strokeWidth: 2, stroke: 'rgba(255,255,255,.9)'})
  Labels.selectAll('#neighborhoods-centroids2 text')
    // .st({strokeWidth: .1, stroke: '#000'})
})


var isChromeIOS = navigator.userAgent.match('CriOS')
var isIframe = self != top

// add top UI
!(function(){
  var buttonSel = graphSel.append('div.button-container')


  var linkSel = buttonSel.append('div')
  if (!isIframe){
    linkSel.append('div')
      .html('New York Neighborhoods<br> Drawn By New Yorkers')
      .st({marginBottom: 20, marginLeft: '1em'})
  }
  linkSel.append('a.button')
    .at({href: isIframe ? 'index.html' : '../index.html'})
    .text(isIframe ? 'Full Screen →' : isMobile ? '← Uncertainty Over Space' : '← Uncertainty Over Space')
    .on('click', () => {
      if (!isIframe) return 
      d3.event.preventDefault()
      window.open(window.location, '_blank'); 
    })

  var layers = d3.entries({Labels, Neighborhoods, Buildings})
  layers.forEach(d => d.value.active = true)

  buttonSel.appendMany('div.button', layers)
    .st({display: 'inline-block', marginRight: 32, marginTop: 10, cursor: 'pointer'})
    .html(makeHtml)
    .on('click', function(d){
      d.value.active = !d.value.active
      d.value.st({opacity: d.value.active ? 1 : 0})
      d3.select(this).html(makeHtml)
    })

  function makeHtml(d){
    return `<span>${d.value.active ? '☑' : '☐'}</span> ${d.key}`
  }

  if (isIframe){
    linkSel
      .st({display: 'inline-block', marginRight: 32, marginTop: 10})
      .raise()
    buttonSel
      .st({width: 550})
      .selectAll('div').st({marginTop: -5})
  }

  // if (isChromeIOS) buttonSel.append('div').text('Chrome iOS')

})()

var zoom = d3.zoom()
  .on('zoom', zoomed)
  .translateExtent([[0,0], [6000,6000]])
  // zooming out crashes chrome iOS - not android chrome or safari
  .scaleExtent([isChromeIOS ? .5 : .2, 1])

graphSel
  .call(zoom)
  .call(zoom.translateTo, 3450, 2350)

function zoomed(){
  var t = d3.event.transform

  Labels.st({opacity: t.k > .3 && Labels.active ? 1 : 0})

  containerSel.st({
    transform: `translate(${t.x}px,${t.y}px) scale(${t.k})`,
    transformOrigin: '0px 0px',
  })
}

