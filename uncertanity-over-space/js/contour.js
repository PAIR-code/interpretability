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




function offsetTidy([[i0, j0], [i1, j1]]){
  return tidy
    .filter(d => i0 <= d.i && d.i <= i1 && j0 <= d.j && d.j <= j1)
    .map(d => {
      var rv = d.slice()  
      rv.ordered = d.ordered
      rv.i = d.i - i0
      rv.j = d.j - j0

      return rv
    })
}


function drawContour([[i0, j0], [i1, j1]], s, thresholds, isFilled, className){
  var contourData = tidy
    .filter(d => i0 <= d.i && d.i <= i1 && j0 <= d.j && d.j <= j1)

  var maxI = d3.max(contourData, d => d.i)
  var maxJ = d3.max(contourData, d => d.j)

  var makeContours = d3.contours().size([maxI, maxJ]).thresholds(thresholds)

  var grades = d3.range(4).map(i => {
    var rv = {grade: i}

    var values = d3.range(maxI*maxJ).map(d => 0)
    contourData.forEach(d => {
      values[d.i - i0 + (d.j - j0)*(maxI)] = d[i]
    })

    rv.layers = makeContours(values)
    rv.layers.forEach(d => d.grade = rv)

    return rv
  })

  // grades = grades.filter(d => d.grade == 0)
  var sel = d3.select(className).html('').append('div')

  var c = d3.conventions({
    sel,
    width: (maxI - i0 + 1)*s,
    height: (maxJ - j0 + 1)*s,
    // margin: {left: 0, right: 0, top: 0, bottom: 0},
    layers: 'cs',
  })
  c.svg.append('rect').st({stroke: '#fff', width: c.width, height: c.height, fill: 'none', strokeWidth: 10})

  var ctx = c.layers[0]

  var projection = d3.geoIdentity().scale(c.width / (maxI - i0))
  var projection = d3.geoIdentity().scale(s)
  var path = d3.geoPath(projection, ctx)

  contourData.forEach(d =>{
    if (d3.sum(d) < .5) return
    ctx.beginPath()
    ctx.fillStyle = '#eee'

    ctx.rect((d.i - i0)*s, (d.j - j0)*s, s, s)
    ctx.fill()
  })


  if (isFilled){
    _.sortBy(_.flatten(grades.map(d => d.layers)), d => d.value).reverse().forEach(d => {
      var color = d3.rgb(colors[d.grade.grade]) 
      color.opacity = .1 + d.value/2
      color.opacity = d.value
      ctx.fillStyle = color

      ctx.beginPath()
      path(d)
      ctx.fill()
    })
  } else {
    grades.forEach(grade => {
      ctx.strokeStyle = colors[grade.grade]
      grade.layers.forEach(d => {
        ctx.beginPath()
        path(d)
        ctx.stroke()
      })
    })
  }
}

function drawProstatectomyStatic(){
  var drawFns = {}

  drawFns.sm = () => {
    var sel = d3.select('.contour-sm').html('').append('div').st({marginTop: 10, maxWidth: 630})

    sel.appendMany('div', d3.range(4))
      .st({display: 'inline-block', width: 600/2, border: '1px solid #ccc', margin: 4, marginTop: -1})
      .st({border: '3px solid #000', borderColor: d => colors[d]})
      .each(function(i){
        var fn = (d, ctx, s) => {
          var color = d3.rgb(colors[i])
          var color = d3.rgb('#000')
          color.opacity = d[i]//*d[i]
          ctx.fillStyle = color
          ctx.fillRect(d.i*s, d.j*s, s, s)
        }

        renderCells(tidy, d3.select(this).append('div'), 3, fn)
      })
  }

  drawFns.argmaxTint = () => {
    var sel = d3.select('.argmax-tint').html('').append('div')
    renderCells(tidy, sel, 5, cellRenders.argmaxColor)
  }

  drawFns.argmaxSize = () => {
    var sel = d3.select('.argmax-size').html('').append('div')
    var c = renderCells(tidy, sel, 5, cellRenders.argmaxSize, 'cs')
    addPatchHighlight(c)

  }

  drawFns.argmaxFlicker = () => {
    var sel = d3.select('.argmax-flicker').html('').append('div')
    renderCells(tidy, sel, 10, cellRenders.argmaxSize)

    sel
      .st({height: 300, top: -100, position: 'relative'})
      .transition().duration(1000)
      .st({transform: 'scale(.4)'})

    d3.select('.argmax-tint').on('mousemove', function(){
      sel.translate(d3.mouse(this))
    })
  }

  drawFns.topTwoColor = () => {
    var sel = d3.select('.top-two-size').html('').append('div')
    renderCells(tidy, sel, 5, cellRenders.topTwoColor)
  }

  drawFns.topTwoSize = () => {
    var sel = d3.select('.top-two-color').html('').append('div')
    var c = renderCells(tidy, sel, 5, cellRenders.topTwoSize, 'cs')
  }

  function addPatchHighlight(c){
    var [ctx, svg] = c.layers

    var {s} = c
    var pos = [10, 20]
    svg.parent().st({overflow: 'visible'})

    svg.append('g')
      .translate(d => [87*s + s/2, 8*s + s/2])
      .append('circle')
      .at({r: s + 1, stroke: '#000', fill: 'none', strokeWidth: 1})
      .parent()
      .append('path').at({stroke: '#000', d: `M ${s + 1} 0 H 20`})
      .parent()
      .append('text').text('A single patch')
      .translate([23, 3])
      .st({fontSize: 12, fontFamily: 'monospace'})


  }
  
  drawFns.topTwoColorZoom = () => {
    var sel = d3.select('.top-two-color-zoom').html('').append('div')
    var offsetData = offsetTidy([[40, 40], [80, 80]])
    var c = renderCells(offsetData, sel, 10, cellRenders.topTwoColor, 'csd')
    c.type = 'topTwoColor'
    addHighlight(c)
  }
  
  drawFns.topTwoSizeZoom = () => {
    var sel = d3.select('.top-two-size-zoom').html('').append('div')
    var offsetData = offsetTidy([[40, 40], [80, 80]])
    var c = renderCells(offsetData, sel, 10, cellRenders.topTwoSize, 'csd')
    c.type = 'topTwoSize'
    addHighlight(c)
  }

  function addHighlight(c){
    c.sel.translate(-120, 0)
    var [ctx, svg, divSel] = c.layers

    var {s, flatData} = c

    var highlights = zoomHighlights.map(([i, j]) => flatData.find(d => d.i == i && d.j == j))

    svg.parent().st({overflow: 'visible'})
    svg.appendMany('circle', highlights)
      .translate(d => [d.i*s + s/2, d.j*s + s/2])
      .at({r: s -3, stroke: '#000', fill: 'none', strokeWidth: .5})

    svg.appendMany('path', highlights)
      .at({
        d: d => ['M', d.i*s + s + 2, Math.round(d.j*s + s/2) + .5, 'H', c.width + 40 ].join(' '),
        stroke: '#000',
        strokeWidth: .5,
      })

    var gSel = svg.appendMany('g', highlights)
      .translate(d => [c.width + 15, Math.round(d.j*s) + .5])

    var pad = 3
    gSel.append('rect')
      .at({width: s + pad, height: s + pad, x: -pad/2, y: -pad/2, fill: '#fff'})
    
    gSel.each(function(d){
      var sel = d3.select(this)
  
      if (c.type == 'topTwoColor'){
        var i = d3.interpolate(colors[d.ordered[0].i], colors[d.ordered[1].i])
        var ratio = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)
        sel.append('rect')
          .at({width: s, height: s, fill: i(ratio)})
      } else {
        sel.append('rect')
          .at({width: s, height: s, fill: colors[d.ordered[0].i]})

        var v = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)
        v = Math.pow(v, .5)
        sel.append('rect')
          .at({width: v*s, height: v*s, fill: colors[d.ordered[1].i]})
      }


    })

    divSel.appendMany('div', highlights)
      .st({position: 'absolute'})
      .translate(d => [c.width + 40, d.j*s - 10])
      .append('vec').datum(d => d.map(d => ('' + Math.round(d*100)/100).replace('0.', '.')))


    highlights.forEach(d => {
      // console.log(d.ordered[0].i, d.ordered[1].i)
    })

  }
  
  // drawFns.topTwoSizeZoom2 = () => {
  //   var sel = d3.select('.top-two-size-zoom2').html('').append('div')
  //   renderCells(offsetTidy([[40,40], [80, 80]]), sel, 10, cellRenders.topTwoSize)
  // }
  
  drawFns.topTwoLZoom = () => {
    var sel = d3.select('.top-two-l-zoom2').html('').append('div')
    renderCells(offsetTidy([[40,40], [80, 80]]), sel, 10, cellRenders.topTwoL)
  }


  drawFns.stacked = () => {
    var sel = d3.select('.stacked').html('').append('div')
    renderCells(tidy, sel, 5, cellRenders.stacked)
  }

  drawFns.stacked2 = () => {
    var sel = d3.select('.stacked2').html('').append('div')
    renderCells(offsetTidy([[40,40], [80, 80]]), sel, 10, cellRenders.stacked2)
  }

  drawFns.rounded = () => {
    var sel = d3.select('.rounded').html('').append('div')
    renderCells(offsetTidy([[40,40], [80, 80]]), sel, 10, cellRenders.rounded)
  }

  drawFns.roundedSorted = () => {
    var sel = d3.select('.rounded-sorted').html('').append('div')
    renderCells(offsetTidy([[40,40], [80, 80]]), sel, 10, cellRenders.roundedSorted)
  }



  d3.values(drawFns).forEach(d => d())
}



function initContour(){
  drawContour([[0, 0], [Infinity, Infinity]], 6, [.3, .5, .7, .8, .9, 1], 0, '.contour')
  drawContour([[40, 50], [70, 70]], 12, [.1, .2, .3, .5, .7, .8, .9, 1], 0, '.contour-zoom')
  drawContour([[0, 0], [Infinity, Infinity]], 6, [.1, .2, .3, .5, .6], 1, '.contour-fill')

  drawProstatectomyStatic()
  addVec()
}
if (window.tidy) initContour()



addVec()

// MISC
function addVec(){
  d3.selectAll('vec').each(function(){
    var sel = d3.select(this)

    if (!sel.datum()){
      var vals = sel.text()
        .replace('[', '')
        .replace(']', '')
        .split(',')

      sel.datum(vals)
    }
    
    if (sel.datum().v) return

    sel.html('').st({fontSize: 14}).st({position: 'relative', left: 0})
    sel.append('span').text('[')

    var width = 31
    var height = 24

    var numSel = sel.appendMany('span', d => d)


    var svgSel = numSel
      .append('div').st({display: 'inline-block', position: 'relative', width, height}) 
      .append('div')
      .text(d => d)
      .parent()
      .append('svg')
      .at({width, height})
      .st({position: 'absolute', zIndex: -1000 })
      .lower()

    svgSel.append('rect')
      .at({width, height, fill: (d, i) => colors[i], fillOpacity: .3})

    svgSel.append('rect')
      .at({width, height: d => Math.max(1, d*height), y: d => height - d*height, fill: (d, i) => colors[i]})


    numSel.append('span').text((d, i) => i == 3 ? '' : ',')
      .st({position: 'relative', left: -2})

    sel.append('span').text(']')
      .st({position: 'relative', left: 0})
  })

}


d3.select('.city-image')
  .selectAll('.pointer').remove()

d3.select('.city-image')
  .st({cursor: 'pointer'})
  .append('div.pointer')
  .lower()
  .st({left: -980/2 - 20, position: 'relative'})
  .append('div')



