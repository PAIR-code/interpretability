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




var datapath = '/2019-07-tcga-confidence'
var slideId = '21A29827-7896-436D-AB52-E7EDFC91E7D0'

var zoomHighlights = [
  [36, 24],
  [35, 27],
  [32, 30],
]

function calcFlatHack(data){
  var flatData = []
  var zh = zoomHighlights

  data.forEach((col, j) => {
    col.forEach((d, i) => {
      d = d.slice(d)
          
      // hack to show flaws with two color
      if (i > 65 && j > 60){
        if (d[1] > .5) d[3] = d[3] + .3
        if (d[3] > .5) d[1] = d[1] + .3
      }

      if (i == zh[0][0] + 40 && j == zh[0][1] + 40) d = [.01, .33, .35, .25]
      if (i == zh[1][0] + 40 && j == zh[1][1] + 40) d = [.03, .21, .35, .23]
      if (i == zh[2][0] + 40 && j == zh[2][1] + 40) d = [.02, .34, .25, .38]

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









d3.text(`tcga-slide/softmax.json`, (err, res) => {
  var str = res.replace(/NaN/g, 'null')
  data = JSON.parse(str)
  originalData = data

  // only use every 4th patch
  data = data
    .filter((d, i) => i % 2)
    .map(d => d.filter((e, i) => i % 2))

  tidy = calcFlatHack(data)
    .filter(d => !isNaN(d[0]))
    .filter(d => d.sum > .6)

  initGrid(data)
  initContour()
  initAnimation()
  initGraphs()

})

function initGraphs(){
  var queue = d3.queue(1)

  d3.selectAll('.sandbox-graph').each(function(){
    queue.defer(cb => {
      addViewer.call(this)
      setTimeout(cb, 3000)
    })
  })

  queue.await(err => err ? console.log({err}) : '')
}



function addViewer(){
  var sel = d3.select(this).classed('mc-workspace', 1).html('')

  sel.append('div.pointer').append('div')
  sel.append('div.openseadragon1.mc-interactions-layer')
  sel.append('div.canvas-overlay.sandbox-layer-canvas')

  var viewer = OpenSeadragon({
    element: sel.select('.openseadragon1').node(),
    prefixUrl: `${datapath}/lib/images/`,
    tileSources: `${datapath}/img/${slideId}.dzi`,
    showNavigationControl: false,
    tileSources: {
      Image: {
        xmlns:    "http://schemas.microsoft.com/deepzoom/2008",
        Url:      "https://storage.googleapis.com/uncertainty-over-space/21A29827-7896-436D-AB52-E7EDFC91E7D0_files/",
        Format:   "jpeg", 
        Overlap:  "1", 
        TileSize: "254",
        Size: {
          Height: "79073",
          Width:  "95616"
        }
      }
    },
    defaultZoomLevel: 1,
    // tileSources: `http://adampearce98.nyc.corp.google.com:8000/2019-07-tcga-confidence/img/${slideId}.dzi`
  })
  // window.viewer = viewer
  viewer.addHandler('open', function() {
    // viewer.viewport.fitBounds(zoomLocation, true)
    viewer.viewport.fitBounds(new OpenSeadragon.Rect(0, .32, 1, .5), false)
  })


  

  var width = sel.node().offsetWidth
  var height = sel.node().offsetHeight

  var c = d3.conventions({
    sel: sel.select('.canvas-overlay').html(''),
    margin: {top: 0, left: 0, bottom: 0, right: 0},
    width, 
    height,
    layers: 'c'
  })

  var ctx = c.layers[0]
  ctx.clearRect(0, 0, width, height)

  var sandboxThis = {
    viewportSize: {x: width, y: height},
    softmaxData: data, 
    flatData: tidy,
    viewport: {getSlides: () => [{id: slideId}]},
    sandboxOverlay: sel.attr('sandboxFn')
  }

  var drawInfo = {}

  var [nrows, ncols] = [data, data[0]].map(d => d.length)
  var aspectRatio = width/height

  var sandboxFn = null

  var datum = {
    sel,
    sandboxThis,
    sandboxFn: null,
    ctx,
    drawInfo
  }
  sel.datum(datum)

  viewer.addHandler('update-viewport', () => {
    zoom = viewer.viewport.getZoom(true);
    bbox = viewer.viewport.getBoundsNoRotate(true)

    var s = width/ncols/bbox.width
    var x0patch = bbox.x*ncols
    var y0patch = bbox.y*ncols
    Object.assign(drawInfo, {ctx, s, x0patch, y0patch, colors})

    if (!datum.sandboxFn){
      datum.sandboxFn = initSandbox(sel, sandboxThis, ctx, drawInfo, true)
    }
    datum.sandboxFn()
  })

  

}
