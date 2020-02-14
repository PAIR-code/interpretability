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



var gleasonColors = ['#ccc', '#4CAF50', '#FF9800', '#F44336']
var colors = gleasonColors

function calcFlatData(data){
  var flatData = []

  data.forEach((col, j) => {
    col.forEach((d, i) => {
      d = d.slice(d)
      
      d.i = i
      d.j = j
          
      // Normalised softmax values
      d.sum = d3.sum(d)
      d.forEach((e, i) => d[i] = e/d.sum)

      d.ordered = d.map((v, i) => ({v, i})).sort((a, b) => a.v < b.v ? 1 : -1)
      d.orig = d.slice()

      flatData.push(d)
    })
  })

  return flatData
}


function renderCells(flatData, sel, s, cellRender, layers='c', colors=gleasonColors){
  var c = d3.conventions({
    sel,
    width:  (d3.max(flatData, d => d.i) + 1)*s,
    height: (d3.max(flatData, d => d.j) + 1)*s,
    margin: {left: 0, right: 0, top: 0, bottom: 0},
    layers,
  })
  c.flatData = flatData
  c.s = s

  flatData.forEach(d => cellRender(d, c.layers[0], s, colors))

  return c
}


window.cellRenders = {}

cellRenders.argmaxColor = function(d, ctx, s, colors){
  var color = d3.rgb(colors[d.ordered[0].i]) 
  color.opacity = d.ordered[0].v*d.ordered[0].v
  ctx.fillStyle = color
  ctx.fillRect(d.i*s, d.j*s, s, s)
}

cellRenders.topTwoColor = function(d, ctx, s, colors){
  var i = d3.interpolate(colors[d.ordered[0].i], colors[d.ordered[1].i])
  var ratio = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)
  ctx.fillStyle = i(ratio)

  ctx.fillRect(d.i*s, d.j*s, s, s)
}

cellRenders.stacked = function(d, ctx, s, colors){
  var prev = 0
  var s1 = s - .3
  d.forEach((v, i) => {
    // if (v < .05) return 
    ctx.fillStyle = colors[i]
    ctx.fillRect(d.i*s, d.j*s + prev*s1, s1, s1*v)

    prev += v
  })
}
cellRenders.stacked2 = function(d, ctx, s, colors){
  var prev = 0
  var s1 = s - .3
  d.ordered.forEach((cat, i) => {
    if (i > 1) return 
    ctx.fillStyle = colors[cat.i]
    ctx.fillRect(d.i*s, d.j*s + prev*s1, s1, s1*cat.v)

    prev += cat.v
  })
}

cellRenders.argmaxSize = function(d, ctx, s, colors){
  ctx.fillStyle = colors[d.ordered[0].i]
  var v = d.ordered[0].v
  ctx.fillRect(d.i*s, d.j*s, s*v, s*v)
}

cellRenders.topTwoSize = function(d, ctx, s, colors){
  ctx.fillStyle = colors[d.ordered[0].i]
  ctx.fillRect(d.i*s, d.j*s, s, s)

  ctx.fillStyle = colors[d.ordered[1].i]
  var v = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)

  v = Math.pow(v, .5)
  ctx.fillRect(d.i*s, d.j*s, s*v, s*v)
}

cellRenders.topTwoL = function(d, ctx, s, colors){
  var s0 = Math.pow(d.ordered[0].v + d.ordered[1].v, .7)*s
  ctx.beginPath()
  ctx.fillStyle = colors[d.ordered[0].i]
  ctx.fillRect(d.i*s, d.j*s, s0, s0)
      
  var s1 = Math.pow(d.ordered[1].v, .7)*s
  ctx.beginPath()
  ctx.fillStyle = colors[d.ordered[1].i]
  ctx.fillRect(d.i*s, d.j*s, s1, s1)
}

cellRenders.rounded = function(d, ctx, s, colors){
  var vals = d.slice()
  var rounded = d3.range(4).map(i => {
    var maxI = d3.scan(vals, (a, b) => b - a)
    vals[maxI] -= .25
    return maxI
  })
  d3.shuffle(rounded)
  
  var s2 = (s - .2)/2
  
  ctx.fillStyle = colors[rounded[0]]
  ctx.fillRect(d.i*s, d.j*s, s2, s2)
  
  ctx.fillStyle = colors[rounded[1]]
  ctx.fillRect(d.i*s + s2, d.j*s, s2, s2)
  
  ctx.fillStyle = colors[rounded[2]]
  ctx.fillRect(d.i*s + s2, d.j*s + s2, s2, s2)
  
  ctx.fillStyle = colors[rounded[3]]
  ctx.fillRect(d.i*s, d.j*s + s2, s2, s2)
}

cellRenders.roundedSorted = function(d, ctx, s, colors){
  var vals = d.slice()
  var rounded = d3.range(4).map(i => {
    var maxI = d3.scan(vals, (a, b) => b - a)
    vals[maxI] -= .25
    return maxI
  })
  var i2index = {}
  d.ordered.forEach((d, index) => i2index[d.i] = index)
  rounded = _.sortBy(rounded, i => i2index[i])
  
  var s2 = (s - .2)/2
  
  ctx.fillStyle = colors[rounded[0]]
  ctx.fillRect(d.i*s, d.j*s, s2, s2)
  
  ctx.fillStyle = colors[rounded[1]]
  ctx.fillRect(d.i*s + s2, d.j*s, s2, s2)
  
  ctx.fillStyle = colors[rounded[3]]
  ctx.fillRect(d.i*s + s2, d.j*s + s2, s2, s2)
  
  ctx.fillStyle = colors[rounded[2]]
  ctx.fillRect(d.i*s, d.j*s + s2, s2, s2)
}

cellRenders.roundedNoSort = function(d, ctx, s, colors){
  var vals = d.slice()
  var rounded = d3.range(4).map(i => {
    var maxI = d3.scan(vals, (a, b) => b - a)
    vals[maxI] -= .25
    return maxI
  })
  var i2index = {}
  d.ordered.forEach((d, index) => i2index[d.i] = index)
  
  var s2 = (s - .2)/2
  
  ctx.fillStyle = colors[rounded[0]]
  ctx.fillRect(d.i*s, d.j*s, s2, s2)
  
  ctx.fillStyle = colors[rounded[1]]
  ctx.fillRect(d.i*s + s2, d.j*s, s2, s2)
  
  ctx.fillStyle = colors[rounded[2]]
  ctx.fillRect(d.i*s + s2, d.j*s + s2, s2, s2)
  
  ctx.fillStyle = colors[rounded[3]]
  ctx.fillRect(d.i*s, d.j*s + s2, s2, s2)
}





var simulatedData = d3.range(50).map(i => {
  return d3.range(50).map(j => {
    // return [.005, 1000/dist(i, j, 35.1, 10), 500/dist(i, j, 20.1, 30), .05/dist3(i, j, 9.1, 5)]
    return [.005, 1000/dist(i, j, 35.1, 10), 500/dist(i, j, 20.1, 30), .6/dist2(i, j, 9.1, 5)]
  })
})

function dist2(x0, y0, x1, y1){
  var dx = x0 - x1
  var dy = y0 - y1

  var val = dx*dx + dy*dy
  return Math.pow(val, .9)
}

function dist3(x0, y0, x1, y1){
  var dx = x0 - x1
  var dy = y0 - y1

  var val = dx + dy
  return val
}

function dist(x0, y0, x1, y1){
  var dx = x0 - x1
  var dy = y0 - y1

  var val = dx*dx + dy*dy
  return val*val
}


var simulatedFlatData = calcFlatData(simulatedData)

var key2string = {
  argmaxColor: 'Argmax Tint',
  argmaxSize: 'Argmax Size',
  topTwoColor: 'Top Two Color',
  topTwoSize: 'Top Two Size',
  rounded: 'Rounded',
  stacked: 'Stacked Bar'
}


var sel = d3.select('.grid-gallery').html('')
  .classed('full-width', 1)
  .classed('px980', 1)
  .append('div')

'argmaxColor topTwoColor stacked argmaxSize topTwoSize rounded'
  .split(' ')
  .forEach(key => {
    var rowSel = sel.append('div.render-container')
    rowSel.append('b').text(key2string[key])
    renderCells(simulatedFlatData, rowSel.append('div'), 6, cellRenders[key])
  })


sel.append('i').text('Simulated uncertainty data, shown six different ways.')


d3.loadData('neighborhood/sunnyside-small.json', (err, res) => {
  // var allCityColors = ['#012394', '#E2792F', '#865327', '#E71E24', '#12852D', '#A9159C',]
  var cityColors = ['#ccc', "#1f77b4", "#2ca02c", "#d62728", "#9467bd"]
  var cityColors = ['#ccc', '#012394', '#A9159C', '#FBC20F', '#12852D']

  var {nrow, ncol, neighborhoods} = res[0] 
  var sunnydata = d3.range(nrow).map(i => {
    return d3.range(ncol).map(j => {
      var index = j*nrow + i
      return [
        .1, 
        neighborhoods[0].grid[index],
        neighborhoods[2].grid[index],
        neighborhoods[3].grid[index],
        neighborhoods[4].grid[index],
        // neighborhoods[1].grid[index],
      ]
    })
  })

  var sunnyflat = calcFlatData(sunnydata)

  var sel = d3.select('.nyc-draw-it').html('').append('div')

  'argmaxColor topTwoColor stacked argmaxSize topTwoSize rounded'
    .split(' ')
    .forEach(key => {
      var rowSel = sel.append('div.render-container')
      rowSel.append('b').text(key2string[key])
      renderCells(sunnyflat, rowSel.append('div'), 6, cellRenders[key], 'c',cityColors)
    })


})



