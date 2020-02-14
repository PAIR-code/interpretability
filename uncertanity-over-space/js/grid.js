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




d3.select('body').selectAppend('div.tooltip.tooltip-hidden')


window.initGrid = () => {
  var gridSel = d3.select('.grid').html('').st({margin: '0px auto', maxWidth: 900}).st({position: 'relative', left: 50})

  gridSel.append('div.pointer').append('div')

  gridSel.append('div.softmax')
  gridSel.append('div.heatmap')


  tidyGrid = calcFlatHack(data).filter(d => d.sum > .5)
  updateOpacity = makeUpdateOpacity(tidyGrid)
  
  render([1, 1, 1, 1])
  drawGrid()
}
if (window.data) initGrid(window.data)


function drawGrid(){
  var s = 12
  
  var sel = d3.select('.grid .softmax').html('')
  
  var color = d3.scaleOrdinal ()
    .domain(['4+4', '4+5', '5+4', '5+5'])
    .range(["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"])
    .range(["#cbc9e2","#9e9ac8","#756bb1","#54278f"])

    // .range(["#cbc9e2","#9e9ac8","#756bb1","#54278f", '#f0f'])
  
  var keySel = sel.append('div')
    .st({fontSize: 15})
    .append('span').text('Gleason Grade').st({marginLeft: 21, marginRight: 10, fontWeight: 800})
    .parent()
    .appendMany('span', color.domain().reverse()).st({display: 'inline-block', width: 31, height: 23, textAlign: 'center'})
    .text(d => d)
    .st({background: color, color: (d, i) => i < 2 ? '#fff' : '#000', position: 'relative'})
  
  
  var c = d3.conventions({
    sel: sel.append('div'),
    width: s*(20 + 1),
    height: s*(20 + 1),
    layers: 's',
    margin: {top: 10},
  })

  var extent = 4
  
  var x = d3.scaleLog().domain([1/extent, extent]).range(c.x.range())
  var y = d3.scaleLog().domain([1/extent, extent]).range(c.y.range())
  
  c.sel.on('mousemove', function(){
    var pos = d3.mouse(this)
    
    render([1, 1, x.invert(pos[0]), y.invert(pos[1])])
  })
  
  
  window.points = null
  points = window.points || d3.cross(d3.range(0, c.width, s), d3.range(0, c.width, s))
  
  points.forEach(d => {
    if (d.score) return
    
    d.xVal = x.invert(d[0])
    d.yVal = y.invert(d[1])
    
    updateWeights([1, 1, d.xVal, d.yVal])
    
    d.percents = d3.nestBy(tidyGrid, d => d.maxI)
      .filter(d => d.length*20 > tidyGrid.length && d.key != 0)
    
    d.percents = _.sortBy(d.percents, d => -d.length)
    d.score = (d3.mean(d.percents.slice(0, 2), d => d.key)*2 || 1) - 1
    var topTwo = d.percents.slice(0, 2)
    if (topTwo.length == 1) topTwo[1] = topTwo[0]
    d.score = topTwo.map(d => +d.key + 2).join('+')
  })
  
  
  rectSel = c.svg.appendMany('rect', points)
    .at({
      width: s - .11,
      height: s - .1,
      // opacity: d => d.score/5,
      fill: d => color(d.score),
    })
    .translate(d => d)
    // .call(d3.attachTooltip)
    .on('click', d => console.log(d))
  
  rectSel.filter(d => d[0]/s == 10 && d[1]/s == 10)
    // .st({stroke: '#fff'})
    .raise()
    
  var axisTicks = ['1/16', '1/4', '1', '4', '16']
  var axisTicks = ['1/4', '1', '4']
  // var axisTicks = ['1/8', '1/4', '1/2', '1','2' '4', '16']
  
  c.svg.appendMany('text.axis', axisTicks)
    .translate(d => [x(eval(d)) , c.height + 20])
    .text(d => d + '×')
    .at({textAnchor: 'middle'})
    .st({fontSize: 12})
  
  c.svg.appendMany('text.axis', axisTicks)
    .translate(d => [-10, y(eval(d))])
    .text(d => d + '×')
    .at({textAnchor: 'end', dy: '.33em'})
    .st({fontSize: 12})
  
  c.svg.append('text.axis')
    .translate([c.width/2, c.height + 40])
    .text('Pattern 4 Weight')
    .at({textAnchor: 'middle', fontWeight: 500, fill: colors[2]})
  
  c.svg.append('g.axis')
    .translate([-40, c.height/2])
    .append('text')
    .at({transform: 'rotate(-90)'})
    .text('Pattern 5 Weight')
    .at({textAnchor: 'middle', fontWeight: 500, fill: colors[3]})
  
}


function updateWeights(weights){
  tidyGrid.forEach(d => {
    d[0] = d.orig[0]*weights[0]
    d[1] = d.orig[1]*weights[1]
    d[2] = d.orig[2]*weights[2]
    d[3] = d.orig[3]*weights[3]
    
    var total = d3.sum(d)
    
    d[0] = d[0]/total
    d[1] = d[1]/total
    d[2] = d[2]/total
    d[3] = d[3]/total
    
    d.maxI = 0

    d.forEach((v, i) => {
      if (d[i] > d[d.maxI]) d.maxI = i
    })

    d.total = total
  })

}


function render(weights){
  updateWeights(weights)
  updateOpacity()
}



function makeUpdateOpacity(){
  var maxX = d3.max(tidyGrid, d => d.i)
  var maxY = d3.max(tidyGrid, d => d.j)

  var sel = d3.select('.grid .heatmap').append('div')

  var s = 6
  
  var c = d3.conventions({
    sel,
    width: (maxX + 1)*s,
    height: (maxY + 1)*s,
    margin: {left: 0, right: 0, top: 0, bottom: 0},
    layers: 'c',
  })

  var ctx = c.layers[0]
  
  return () => {
    ctx.fillStyle = 'rgba(255,255,255,1)'
    ctx.fillRect(0, 0, c.width, c.height)

    tidyGrid.forEach(d =>{
      ctx.beginPath()
      var color = d3.rgb(colors[d.maxI]) // also opacity

      color.opacity = d[d.maxI]
      color.opacity = Math.pow(d[d.maxI], 1.7)
      ctx.fillStyle = color
      ctx.rect(d.i*s, d.j*s, s, s)
      ctx.fill()
    })
  }

}






















