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




function initSandbox(sel, sandboxThis, ctx, drawInfo){


  function calcByCell(flatData, cellDim, chunks=4){
    var iKey = 'iCellDim' + cellDim
    var jKey = 'jCellDim' + cellDim

    flatData.forEach(d => {
      d[iKey] = Math.floor(d.i/cellDim)*cellDim
      d[jKey] = Math.floor(d.j/cellDim)*cellDim
    })

    var byCell = d3.nestBy(flatData, d => [d[iKey], d[jKey]])
    byCell.forEach(cell => {
      cell.meanCertainty = d3.mean(cell, d => d.ordered[0].v)

      cell.i = cell[0][iKey]
      cell.j = cell[0][jKey]

      cell.ci = cell.i + cellDim/2
      cell.cj = cell.j + cellDim/2

      // Mean value of each gleason pattern in the cell.
      cell.meanVals = d3.range(4).map(i => d3.mean(cell, d => d[i]))
      cell.rounded = roundSoftmax(cell.meanVals, chunks)
    })

    return byCell
  }

  function roundSoftmax(array, chunks){
    var vals = array.slice()

    return d3.range(chunks)
      .map(i => {
        var maxI = d3.scan(vals, (a, b) => b - a)
        vals[maxI] -= 1/chunks
        return maxI
      })
      .slice()
      .sort()
  }

  function calcByRound(flatData, chunks){
    flatData.forEach(d => {
      d.weight = d3.sum(d, (v, i) => v*i)
      d.rounded = roundSoftmax(d, chunks)
    })

    return d3.nestBy(flatData, d => d.rounded.join(' '))
  }

  function calcTopology(flatData){
    var geodata = {'type': "FeatureCollection"}

    geodata.features = flatData.map(d => {
      var {i, j} = d

      var s = 1

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [[i, j], [i, j + s], [i + s, j + s], [i + s, j], [i, j]]
          ]
        },
        properties: {d},
      }
    })

    return topojson.topology({boxes: geodata})
  }

  function calcByPattern(topology, patternKey=d => d.properties.d.ordered[0].i, minSize=0){
    var path = d3.geoPath();

    var byPattern = d3.nestBy(topology.objects.boxes.geometries, patternKey);
    byPattern.forEach(pattern => {
      var obj = {type: 'GeometryCollection', geometries: pattern};
      pattern.mesh = topojson.mesh(topology, obj, (a, b) => a == b);
      if (minSize){
        pattern.mesh.coordinates = pattern.mesh.coordinates.filter(d => d.length > minSize)
      }
      pattern.path = path(pattern.mesh);
    })

    byPattern.topology = topology;

    return byPattern;
  }

  function getZoomedGeoPath(s, x0patch, y0patch){
    function matrix(a, b, c, d, tx, ty) {
      return d3.geoTransform({
        point: function(x, y) {
          this.stream.point(a * x + b * y + tx, c * x + d * y + ty)
        }
      })
    }

    return d3.geoPath().projection(matrix(s, 0, 0, s, -x0patch*s, -y0patch*s))
  }

  function addSVG(){
    var parentSel = sel;

    return parentSel.append('svg').classed('sandbox-generated', true)
      .at({
        width: sandboxThis.viewportSize.x,
        height: sandboxThis.viewportSize.y,
      })
      .st({
        zIndex: 31,
        position: 'absolute', 
        top: 0,
        pointerEvents: 'none',
      })
      .append('g')
  }

  function addRegionPaths(svg, byPattern, colors, persist=false, maskStroke=2){
    if (!persist) svg.selectAll('.region-mask, .region-container').remove()

    var randomKey = Math.random() + '-'

    var regionSel = svg.append('g.region-container')
      .appendMany('path.region.region-stroke', byPattern)
      .at({
        d: d => d.path,
        stroke: d => colors[d.key],
        fill: 'none',
        strokeWidth: 6,
        mask: d => 'url(#mask-region' + randomKey + d.key + ')',
        // strokeDasharray: '2 2'
      })

    var maskSel = svg
      .append('g.region-mask')
      .appendMany('mask', byPattern)
      .at({id: d => 'mask-region' + randomKey + d.key})
      .append('path.region')
      .at({
        d: d => d.path,
        stroke: '#000',
        strokeWidth: maskStroke,
        fill: '#fff',
      })

    var regionPathSel = svg.selectAll('path.region')

    return {regionSel, maskSel, regionPathSel}
  }

  function addCornerOverlay(width=260, height=90){
    return sel.append('div.sandbox-generated')
      .st({
        width,
        height,
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10000,
        background: '#eee',
        border: '1px solid gray',
      })
      .append('div').st({height: '100%', width: '100%'})
  }


  var overlay2InitFn = {}

  // Perturb and draw region outlines several times.
  overlay2InitFn.sketchy = () => {
    var svg = addSVG();

    const colors = ['rgba(0,0,0,0)', ...drawInfo.colors.slice(-3)];
    var flatData = sandboxThis.flatData

    var offsets = [.85, .90, .95, 1, 1.07, 1.15, 1.25];
    flatData.forEach(d => {
      d.orderedOffset = offsets.map(offset => {
        return d3.range(4)
          .map(i => d.map((v, j) => i === j ? v*offset : v))
          .map(valArray => valArray
            .map((v, i) => ({v, i}))
            .sort((a, b) => a.v < b.v ? 1 : -1)
          );
      });
    });

    var topology = calcTopology(flatData);

    var patterns = [];

    offsets.forEach((_, offsetIndex) => {
      d3.range(4).forEach(i => {
        calcByPattern(topology, d =>
          d.properties.d.orderedOffset[offsetIndex][i][0].i)
            // Comparing a string index to int index, need == here.
            .forEach(d => d.key == i ? patterns.push(d) : null);
      });
    });

    patterns.forEach(d => {
      d.topology = topojson.topology({mesh: d.mesh});
      d.topology = topojson.presimplify(d.topology);

      var min_weight = topojson.quantile(d.topology, .19);
      d.simplified = topojson.simplify(d.topology, min_weight);
      d.mesh = topojson.mesh(d.simplified);
    });

    window.patterns = patterns

    var regionSel = svg.append('g').classed('region-container', true)
      .selectAll('path').data(patterns).enter().append('path')
      .attr('stroke', d => colors[d.key])
      .attr('fill', 'none')
      .attr('stroke-width', 1);

    function updateZoom(){
      var {s, x0patch, y0patch} = drawInfo;
      var line = d3.line().x(d => d[0]).y(d => d[1]).curve(d3.curveBasisClosed);

      var path = getZoomedGeoPath(s, x0patch, y0patch);
      regionSel.attr('d', d => {
        var loops = path(d.mesh)
          .split('M')
          .slice(1)
          .map(d => d.replace(/Z/, '').split('L').map(d => d.split(',')));

        return loops.map(line).join(' ');
      });
    }

    updateZoom();


    return updateZoom;
  }

  // Draw the top two highest softmax values as overlaid squares.
  overlay2InitFn.topTwo = () => {
    flatData = sandboxThis.flatData

    return function(){
      var {s, x0patch, y0patch, ctx, colors} = drawInfo

      ctx.clearRect(0, 0, sandboxThis.viewportSize.x, sandboxThis.viewportSize.y)

      flatData.forEach(d => {
        var x = s * (d.i - x0patch)
        var y = s * (d.j - y0patch)


        ctx.fillStyle = colors[d.ordered[0].i]
        ctx.fillRect(x, y, Math.ceil(s), Math.ceil(s))

        // Second rect size proportional to sum of two largest softmax values.
        var s2 = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)

        ctx.fillStyle = colors[d.ordered[1].i]
        ctx.fillRect(x, y, s2*s, s2*s)
      })
    }
  }

  // Draw all four softmax values as stacked bars.
  overlay2InitFn.stripedFour = () => {
    var flatData = sandboxThis.flatData

    return function(){
      var {s, x0patch, y0patch, ctx, colors} = drawInfo

      ctx.clearRect(0, 0, sandboxThis.viewportSize.x, sandboxThis.viewportSize.y)

      var s1 = s + 1
      flatData.forEach(patch => {
        var x = s * (patch.i - x0patch)
        var y = s * (patch.j - y0patch)

        var prev = 0
        patch.forEach((v, i) =>{
          ctx.fillStyle = colors[i]
          ctx.fillRect(x, y + prev*s1, s1, s1*v)

          prev += v
        })
      })
    }
  }

  // Draw all four softmax values as stacked bars, grouping them based on zoom.
  overlay2InitFn.stripedFourGrouped = () => {
    var flatData = sandboxThis.flatData
    var byCellCache = {}
    ;[1, 2, 4, 8].forEach(cellDim => {
      byCellCache[cellDim] = calcByCell(flatData, cellDim)
    })

    return function(){
      var {s, x0patch, y0patch, ctx, colors} = drawInfo

      ctx.clearRect(0, 0, sandboxThis.viewportSize.x, sandboxThis.viewportSize.y)

      var logs2cellDim = [8, 8, 8, 4, 2, 1, 1, 1]
      var cellDim = logs2cellDim[Math.round(Math.log2(s))]
      var sd = s*cellDim

      byCellCache[cellDim].forEach(cell => {
        var x = s * (cell.i - x0patch)
        var y = s * (cell.j - y0patch)

        var prev = 0
        cell.meanVals.forEach((v, i) =>{
          ctx.fillStyle = colors[i]
          ctx.fillRect(x, y + prev*sd, sd, sd*v)

          prev += v
        })
      })
    }
  }

  // Softmax values as a cross, grouping them based on zoom.
  overlay2InitFn.crossFourGrouped = () => {
    var flatData = sandboxThis.flatData
    var byCellCache = {}
    ;[1, 2, 4, 8].forEach(cellDim => {
      byCellCache[cellDim] = calcByCell(flatData, cellDim)
    })

    return function(){
      var {s, x0patch, y0patch, ctx, colors} = drawInfo

      ctx.clearRect(0, 0, sandboxThis.viewportSize.x, sandboxThis.viewportSize.y)

      var logs2cellDim = [8, 8, 8, 8, 4, 2, 1, 1, 1]
      var cellDim = logs2cellDim[Math.round(Math.log2(s))]
      var sd = s*cellDim

      byCellCache[cellDim].forEach(cell => {
        const cx = s * (cell.ci - x0patch)
        const cy = s * (cell.cj - y0patch)
        ctx.lineWidth = 2

        var lineSize = sd/1.5

        var l = cell.meanVals[0]*lineSize
        ctx.strokeStyle = colors[0]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + l, cy + l)
        ctx.stroke()

        var l = cell.meanVals[1]*lineSize
        ctx.strokeStyle = colors[1]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - l, cy + l)
        ctx.stroke()

        var l = cell.meanVals[2]*lineSize
        ctx.strokeStyle = colors[2]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx - l, cy - l)
        ctx.stroke()

        var l = cell.meanVals[3]*lineSize
        ctx.strokeStyle = colors[3]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + l, cy - l)
        ctx.stroke()
      })
    }
  }

  // Softmax values as a donut, hovering shows more detail.
  overlay2InitFn.crossFourDonut = () => {
    var flatData = sandboxThis.flatData
    var byCellCache = {}
    ;[1, 2, 4, 8].forEach(cellDim => {
      byCellCache[cellDim] = calcByCell(flatData, cellDim)
    })

    var cellDim = 1
    var sd = 1
    var curByCell = []

    var prevHighlight = ''

    sel.select('.mc-interactions-layer').on('mousemove', function(){
      var {s, x0patch, y0patch, ctx, colors} = drawInfo
      setCellDim(s)

      var [x, y] = d3.mouse(this)
      var i = x/s + x0patch
      var j = y/s + y0patch

      var byCellDist = curByCell.map(d => {
        var dx = i - d.ci
        var dy = j - d.cj

        return Math.sqrt(dx*dx + dy*dy)
      })

      var index = d3.scan(byCellDist)

      // TODO adampearce calc this in pixel distance instead.
      var highlight = Math.abs(byCellDist[index]/cellDim - .5) < .05 ? curByCell[index] : ''

      if (highlight === prevHighlight) return
      prevHighlight = highlight

      render()
      if (highlight === '') return

      highlight.forEach(patch => {
        var x = s * (patch.i - x0patch)
        var y = s * (patch.j - y0patch)

        var prev = 0
        patch.forEach((v, i) =>{
          ctx.fillStyle = colors[i]
          ctx.fillRect(x, y + prev*s, s, s*v)

          prev += v
        })

      })

    })

    function setCellDim(s){
      var logs2cellDim = [8, 8, 8, 8, 8, 4, 2, 1, 1, 1]
      cellDim = logs2cellDim[Math.round(Math.log2(s))]
      sd = s*cellDim
      curByCell = byCellCache[cellDim]
    }

    // TODO adampearce this breaks on very tall screens.
    function render(){
      var {s, x0patch, y0patch, colors, ctx} = drawInfo
      var {viewportSize} = sandboxThis
      setCellDim(s)

      var arc = d3.arc()
        .outerRadius(sd/2)
        .innerRadius(sd/2 - 2)
        .context(ctx)

      var pie = d3.pie()
        .sort(null)
        .value(d => d)

      ctx.clearRect(0, 0, viewportSize.x, viewportSize.y)

      curByCell.forEach(cell =>{
        var cx = s * (cell.ci - x0patch)
        var cy = s * (cell.cj - y0patch)

        ctx.save()
        ctx.translate(cx, cy)

        pie(cell.meanVals).forEach(function(d, i) {
          ctx.beginPath()
          arc(d)
          ctx.fillStyle = colors[i]
          ctx.fill()
        })

        ctx.restore()
      })
    }

    return render
  }

  overlay2InitFn.crossFourSquare = () => {
    var flatData = sandboxThis.flatData
    var byCellCache = {}
    ;[1, 2, 4, 8, 16].forEach(cellDim => {
      byCellCache[cellDim] = calcByCell(flatData, cellDim)
    })

    var cellDim = 1
    var sd = 1
    var curByCell = []

    var prevHighlight = ''

    sel.select('.mc-interactions-layer').on('mousemove', function(){
      var {s, x0patch, y0patch, ctx, colors} = drawInfo
      setCellDim(s)

      var [x, y] = d3.mouse(this)
      var i = x/s + x0patch
      var j = y/s + y0patch

      var byCellDist = curByCell.map(d => {
        var dx = i - d.ci
        var dy = j - d.cj

        return Math.sqrt(dx*dx + dy*dy)
      })

      var index = d3.scan(byCellDist)
      var highlight = curByCell[index]

      if (highlight == prevHighlight) return
      prevHighlight = highlight

      render()
      if (highlight == '') return

      highlight.forEach(d => {
        var x = s * (d.i - x0patch)
        var y = s * (d.j - y0patch)

        ctx.fillStyle = colors[d.ordered[0].i]
        ctx.fillRect(x, y, Math.ceil(s), Math.ceil(s))

        // Second rect size proportional to sum of two largest softmax values.
        var s2 = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)

        ctx.fillStyle = colors[d.ordered[1].i]
        ctx.fillRect(x, y, s2*s, s2*s)
      })

    })

    function setCellDim(s){
      var logs2cellDim = [32, 32, 16, 8, 4, 2, 1, 1, 1]
      cellDim = logs2cellDim[Math.round(Math.log2(s))]
      sd = s*cellDim
      curByCell = byCellCache[cellDim]
    }

    // TODO adampearce this breaks on very tall screens.
    function render(){
      var {s, x0patch, y0patch, colors, ctx} = drawInfo
      var {viewportSize} = sandboxThis
      setCellDim(s)
      ctx.clearRect(0, 0, viewportSize.x, viewportSize.y)

      curByCell.forEach(cell =>{
        var x0 = s * (cell.i - x0patch)
        var y0 = s * (cell.j - y0patch)

        ctx.save()
        ctx.translate(x0, y0)
        ctx.lineWidth = 2

        var pad = 2
        var p0 = pad
        var p1 = sd - pad

        var postions = [
          [[p0, p0], [p1, p0]],
          [[p1, p0], [p1, p1]],
          [[p1, p1], [p0, p1]],
          [[p0, p1], [p0, p0]],
        ]

        postions.forEach((d, i) => {
          ctx.strokeStyle = colors[cell.rounded[i]]
          ctx.beginPath()
          ctx.moveTo(d[0][0], d[0][1])
          ctx.lineTo(d[1][0], d[1][1])
          ctx.stroke()
        })


        ctx.restore()
      })
    }

    return render
  }

  // Overlay regions with POI's for Qian's study
  overlay2InitFn.regionAnnotations = () => {
    // Wizard of Ozing selected slides
    var allAnnotations = [
      {
        slideId: '16ae4bfc74715394',
        bbox: [130, 160, 150, 170],
        text: 'Gleason 3 Region'
      },
      {
        slideId: '16ae4bfc74715394',
        bbox: [110, 180, 120, 200],
        text: 'Gleason 4 Region'
      },
      {
        slideId: '2abaca465eddc327',
        bbox: [50, 50, 55, 55],
        text: 'Gleason 5 Region'
      },
    ]

    var slideId = sandboxThis.viewport.getSlides()[0].id
    var annotations = allAnnotations.filter(d => slideId === d.slideId)

    var svg = addSVG()
    window.svg = svg
    var annotationSel = svg.appendMany('g.annotation', annotations)
    var textSel = annotationSel.append('text').text(d => d.text)
      .at({dy: -4})
    var rectSel = annotationSel.append('rect')
      .at({stroke: 'black', fill: 'none'})

    return function(){
      var {s, x0patch, y0patch} = drawInfo

      annotationSel.translate(d => [
       s * (d.bbox[0] - x0patch),
       s * (d.bbox[1] - y0patch)
      ])

      rectSel.at({
        width: d => s * (d.bbox[2] - d.bbox[0]),
        height: d => s * (d.bbox[3] - d.bbox[1]),
      })
    }
  }

  // First class uncertainity drawn as a blue region.
  overlay2InitFn.uncertainRegions = () => {
    var colors = drawInfo.colors.slice()
    colors['-1'] = 'steelblue'

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)
    var byPattern = calcByPattern(topology, patternKeyFn)

    function patternKeyFn(d){
      var top = d.properties.d.ordered[0]
      return top.v > .5 ? top.i : -1
    }

    var svg = addSVG()
    var {regionPathSel} = addRegionPaths(svg, byPattern, colors)

    return function(){
      var {s, x0patch, y0patch} = drawInfo

      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }
  }

  // Current UI
  overlay2InitFn.topRegion = () => {
    var colors = drawInfo.colors.slice()

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)
    var byPattern = calcByPattern(topology, patternKeyFn)

    function patternKeyFn(d){
      return d.properties.d.ordered[0].i
    }

    var svg = addSVG()
    var {regionPathSel} = addRegionPaths(svg, byPattern, colors)

    return function(){
      var {s, x0patch, y0patch} = drawInfo

      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }
  }

  // A area adjusts the first class uncertainity threshold.
  overlay2InitFn.uncertainRegionsAdjust = () => {
    var regionPathSel = d3.select(null)

    var colors = drawInfo.colors.slice()
    colors['-1'] = 'steelblue'

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)

    var svg = addSVG()

    // Area chart that adjusts uncertainity.
    function drawAreaChart(){
      var c = d3.conventions({
        sel: addCornerOverlay(),
        margin: {bottom: 15, left: 15, right: 15, top: 0}
      })

      c.svg.append('rect')
        .at({x: -c.margin.left, y: -c.margin.top, width: c.totalWidth, height: c.totalHeight, fillOpacity: 0})

      var counts = [0, 0, 0 ,0]
      var areaData = flatData
        .slice()
        .sort(d3.ascendingKey(d => d.ordered[0].v))
        .map((d, index) => {
          var v = d.ordered[0].v
          var pattern = d.ordered[0].i
          counts[pattern]++

          var prev = 0
          var countsDraw = counts.map(d => {
            var rv = {prev, next: prev + d, pattern, d, v}
            prev = prev + d
            return rv
          })

          return {d, v, index, pattern, countsDraw}
        })


      c.y.domain([0, areaData.length])
      c.x.domain([.25, 1])
      window.c = c

      var area = d3.area()
        .x(d => c.x(d.v))
        .y0(d => c.y(d.prev))
        .y1(d => c.y(d.next))

      c.svg.appendMany('path', [0, 1, 2, 3])
        .at({
          d: pattern => area(areaData.map(d => d.countsDraw[pattern])),
          fill: pattern => colors[pattern],
        })

      area.y0(c.height).y1(d => c.y(d.index))(areaData)
      var overlayAreaSel = c.svg.append('path')
        .at({fill: colors[-1]})

      c.svg.appendMany('text', [0, .25, .5, .75, 1])
        .text(d3.format('.0%'))
        .at({textAnchor: 'middle', fill: '#aaa', y: c.height + 9, fontSize: 10})
        .translate(c.x, 0)

      var curPercentSel = c.svg.append('text')
        .at({textAnchor: 'middle', fill: '#aaa', y: c.height + 9, fontSize: 10})
        .st({fill: 'steelblue', fontWeight: 800})

      c.svg.append('text')
        .text('Distribution of patch argmax')
        .at({fontSize: 10, y: 15, x: -10})

      c.svg.on('mousemove', function(){
        var [xPos] = d3.mouse(this)
        var percent = c.x.invert(xPos)
        setPercent(d3.clamp(0, percent, 1))
      })

      function setPercent(percent){
        function patternKeyFn(d){
          var top = d.properties.d.ordered[0]
          return top.v > percent ? top.i : -1
        }


        var byPattern = calcByPattern(topology, patternKeyFn)
        regionPathSel = addRegionPaths(svg, byPattern, colors).regionPathSel

        overlayAreaSel.at({d: area.defined(d => d.v < percent)(areaData)})

        curPercentSel
          .text(d3.format('.0%')(percent))
          .translate(c.x(percent), 0)

        updateZoom()
      }
      setPercent(.6)
    }
    drawAreaChart()

    function updateZoom(){
      var {s, x0patch, y0patch, colors} = drawInfo
      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return updateZoom
  }

  // Adds 4/5 areas as a first class region.
  overlay2InitFn.twoRegion = () => {
    var svg = addSVG()

    var colors = drawInfo.colors.slice()
    colors['-1'] = 'steelblue'

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)

    function patternKeyFn(d){
      var ordered = d.properties.d.ordered
      var top = ordered[0]
      var two = ordered[0].v - .2 > ordered[1].v ? ordered[0] : ordered[1]

      return [top.i, two.i].sort().join('-')
    }

    var byPattern = calcByPattern(topology, patternKeyFn)
    var {regionSel} = addRegionPaths(svg, byPattern, colors)

    byPattern.forEach(d => d.patterns = d.key.split('-'))
    regionSel
      .at({stroke: d => colors[d.patterns[0]]})
      .filter(d => d.patterns[0] !== d.patterns[1])
      .select(function(){
        return this.parentNode.insertBefore(this.cloneNode(0), this.nextSibling)
      })
      .at({
        stroke: d => colors[d.patterns[1]],
        strokeDasharray: '3 3',
      })

    var regionPathSel = svg.selectAll('path.region')

    function updateZoom(){
      var {s, x0patch, y0patch, colors} = drawInfo
      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return updateZoom
  }

  // Adds 4/5 areas as a first class region.
  overlay2InitFn.secondLarge = () => {
    var svg = addSVG()

    var colors = drawInfo.colors.slice()
    colors['-1'] = 'steelblue'

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)

    function patternKeyFn(d){
      var ordered = d.properties.d.ordered

      return ordered[0].v - .5 > ordered[1].v ? -1 : ordered[1].i
    }

    var byPattern = calcByPattern(topology, patternKeyFn, 20).filter(d => d.key != -1)
    var {regionSel} = addRegionPaths(svg, byPattern, colors, false, 8)

    byPattern.forEach(d => d.patterns = d.key.split('-'))

    regionSel
      .filter(d => d.patterns[0] !== d.patterns[1])
      .at({
        fill: d => colors[d.key],
        fillOpacity: .4,
        stroke: 'none',
      })

    var regionPathSel = svg.selectAll('path.region')


    function updateZoom(){
      var {s, x0patch, y0patch, colors} = drawInfo
      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return updateZoom
  }

  // TODO update to work
  function initTwoRegionAdjust(sandboxThis){
    var lastDrawInfo = {s: 1, x0patch: 0, y0patch: 0}
    var regionPathSel = d3.select(null)

    var svg = addSVG(sandboxThis)

    var colors = ['rgba(0,0,0,0)', '#0f0', '#ff0', '#f00']
    colors['-1'] = 'steelblue'

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)

    function drawAreaChart(){
      var c = d3.conventions({
        sel: addCornerOverlay(190, 60),
        margin: {bottom: 25, left: 15, right: 15, top: 0}
      })

      c.svg.append('rect')
        .at({x: -c.margin.left, y: -c.margin.top, width: c.totalWidth, height: c.totalHeight, fillOpacity: 0})

      c.y.domain([0, 1])

      c.xAxis.ticks(5).tickFormat(d3.format('.0%'))
      d3.drawAxis(c)
      c.svg.select('.y').remove()
      c.svg.selectAll('text').st({fill: '#bbb'})
      c.svg.selectAll('line, path').st({stroke: '#bbb'})

      var curPercentSel = c.svg.append('text')
        .at({textAnchor: 'middle', fill: '#aaa', y: c.height + 9, fontSize: 10})
        .st({fill: 'steelblue', fontWeight: 800})
        .at({dy: '.71em'})

      c.svg.append('text')
        .text('softmax0 - softmax1')
        .at({fontSize: 10, y: 15, x: -10})

      c.svg.on('mousemove', function(){
        var [xPos] = d3.mouse(this)
        var percent = c.x.invert(xPos)
        setPercent(d3.clamp(0, percent, 1))
      })

      function setPercent(percent){
        curPercentSel
          .text(d3.format('.0%')(percent))
          
          .translate(c.x(percent), 0)

        function patternKeyFn(d){
          var ordered = d.properties.d.ordered
          var top = ordered[0]
          // return top.i
          var two = ordered[0].v - percent > ordered[1].v ? ordered[0] : ordered[1]

          return [top.i, two.i].sort().join('-')
        }

        var byPattern = calcByPattern(topology, patternKeyFn)
        var {regionSel} = addRegionPaths(svg, byPattern, colors)

        byPattern.forEach(d => d.patterns = d.key.split('-'))
        regionSel
          .at({stroke: d => colors[d.patterns[0]]})
          .filter(d => d.patterns[0] != d.patterns[1])
          .clone()
          .at({
            stroke: d => colors[d.patterns[1]],
            strokeDasharray: '2 2',
          })

        regionPathSel = svg.selectAll('path.region')

        updateZoom()
      }
      setPercent(.05)
    }
    drawAreaChart()



    function updateZoom(){
      var {s, x0patch, y0patch, colors} = lastDrawInfo
      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return function(sandboxThis, ctx, drawInfo){
      lastDrawInfo = drawInfo
      updateZoom()
    }
  }

  // Shows tumor, maybe tumor and definitely not tumor regions.
  overlay2InitFn.tumorRegion = () => {
    var svg = addSVG()

    var colors3 = ["#000", 'steelblue',"rgba(0,0,0,0)"]
    var colors3 = ["#000", 'steelblue',"#ccc"]

    flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)

    function patternKeyFn(d){
      var v = d.properties.d[0]

      return v > .98 ? 2 : v > .3 ? 1 : 0
    }

    byPattern = calcByPattern(topology, patternKeyFn)
    var {regionSel} = addRegionPaths(svg, byPattern, colors3)

    var regionPathSel = svg.selectAll('path.region')

    // TODO adampearce histogram + brush to select percent tumor

    function updateZoom(){
      var {s, x0patch, y0patch} = drawInfo
      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return updateZoom
  }

  // Adds bubble pie chart showing the distribution of visible softmax values.
  overlay2InitFn.bubbleHover = () => {
    var hoveredKey = ''
    var chunks = 6
    var isInitRender = true

    var colors = drawInfo.colors

    var flatData = sandboxThis.flatData
    byRound = calcByRound(flatData, chunks)

    var c = d3.conventions({
      sel: addCornerOverlay(200, 200),
      margin: {bottom: 15, left: 15, right: 15, top: 15}
    })


    byRound.forEach(d => {
      d.vals = d.key.split(' ')

      d.byType = d3.nestBy(d.vals, d => d)

      d.weight = d3.mean(d.vals)
      d.certainty = d3.max(d.byType, d => d.length)

      // 0  1
      // 3  4
      d.xSide = d3.mean(d.vals, d => d === 0 || d === 3 ? 0 : c.width)
      d.ySide = d3.mean(d.vals, d => d === 0 || d === 1 ? 0 : c.width)

      //  3
      //  0
      // 4 5
      d.xSideTri = d3.mean(d.vals, d => [c.width/2, c.width/2, 0, c.width][d])
      d.ySideTri = d3.mean(d.vals, d => [c.height/2, 0, c.height, c.height][d])

      d.x = 0
      d.y = 0
    })

    var groupSel = c.svg.appendMany('g', byRound)
      .translate(d => [d.x, d.y])
      .on('mouseover', d => {
        hoveredKey = d.key
        circleSel.st({strokeWidth: e => e === d ? 2 : .5})
        setPatchHighlights()
      })
      .on('mouseout', d => {
        hoveredKey = ''
        circleSel.st({strokeWidth: .5})
        setPatchHighlights()
      })

    var circleSel = groupSel.append('circle')
      .at({fill: '#fff', stroke: '#000', strokeWidth: .5})

    var pie = d3.pie().sort(null).value(d => d.length)

    var arc = d3.arc()
      .innerRadius(0)
      .outerRadius(d => d.data.r)

    var piePathSel = groupSel.appendMany('path', d => pie(d.byType))
      .at({d: arc, fill: d => colors[d.data.key]})


    function setCirclePos(){
      byRound.forEach(d => d.visibleCount = d3.sum(d, e => e.isVisible))

      var rScale = d3.scaleSqrt()
        .domain([0, 1, d3.sum(byRound, d => d.visibleCount)])
        .range([0, 1, 50])

      byRound.forEach(d => {
        d.r = rScale(d.visibleCount)
        d.byType.forEach(e => e.r = d.r)
      })


      var simulation = d3.forceSimulation(byRound.filter(d => d.visibleCount))
        .force('collide', d3.forceCollide(d => d.r + 1))

      c.x.domain([0, 4])
      c.y.domain([chunks, Math.ceil(chunks/4)])

      // // Uncertainty triangle.
      // simulation
      //   .force('x', d3.forceX(d => c.x(d.weight)))
      //   .force('y', d3.forceY(d => c.y(d.certainty)).strength(1))

      // Pulls patterns to separate corners.
      simulation
        .force('x', d3.forceX(d => d.xSideTri))
        .force('y', d3.forceY(d => d.ySideTri))

      simulation.stop()

      // Run simulation for 400 ticks.
      for (var i = 0; i < 400; ++i){
        simulation.tick()
        byRound.forEach(d => {
          d.x = d3.clamp(d.r*0, d.x, c.width - d.r*0)
          d.y = d3.clamp(d.r*0, d.y, c.height - d.r*0)
        })
      }

      groupSel.transition().duration(isInitRender ? 0 : 300)
        .translate(d => [d.x, d.y])
      circleSel.at({r: d => d.r})
      piePathSel.at({d: arc})
    }

    // Redraw highlighted patches.
    // Just 1px #000 outline for now, no regions.
    function setPatchHighlights(){
      var {s, ctx, x0patch, y0patch} = drawInfo
      ctx.clearRect(0, 0, sandboxThis.viewportSize.x, sandboxThis.viewportSize.y)

      if (!hoveredKey) return

      byRound.forEach(group => {
        if (group.key !== hoveredKey) return

        group.forEach(d => {
          if (!d.isVisible) return

          const x = s * (d.i - x0patch)
          const y = s * (d.j - y0patch)

          ctx.strokeStyle = '#000'
          ctx.strokeRect(x, y, Math.ceil(s), Math.ceil(s))
        })
      })
    }

    function render(){
      var {s, x0patch, y0patch} = drawInfo

      // Calc visible patches.
      flatData.forEach(d => {
        d.curX = s * (d.i - x0patch)
        d.curY = s * (d.j - y0patch)

        var isXVisible = 0 < d.curX && d.curX < sandboxThis.viewportSize.x
        var isYVisible = 0 < d.curY && d.curY < sandboxThis.viewportSize.y

        d.isVisible = isXVisible && isYVisible
      })

      setPatchHighlights()

      // Update circle position.
      setCirclePos()

      isInitRender = false
    }

    return render
  }

  // Top two confidence two the region around the mouse pointer.
  overlay2InitFn.cornerTooltip = () => {
    var {colors, ctx} = drawInfo
    var flatData = sandboxThis.flatData
    var lastMousePos = [0, 0]

    var sizeTT = 200

    var c = d3.conventions({
      sel: addCornerOverlay(sizeTT, sizeTT),
      margin: {bottom: 0, left: 0, right: 0, top: 0},
      layers: 'c',
    })

    var ctxTT = c.layers[0]
    var viewportSize = sandboxThis.viewportSize

    // TODO mousemove doesn't work while dragging
    sel.on('mousemove', function(){
      lastMousePos = d3.mouse(this)
      render()
    })

    function render(){
      var [x, y] = lastMousePos

      ctx.clearRect(0, 0, viewportSize.x, viewportSize.y)
      ctx.strokeStyle = '#ccc'
      ctx.strokeRect(x - sizeTT/2, y - sizeTT/2, sizeTT, sizeTT)


      var {s, x0patch, y0patch} = drawInfo

      var x0patchTT = (x - sizeTT/2)/s + x0patch
      var y0patchTT = (y - sizeTT/2)/s + y0patch

      ctxTT.clearRect(0, 0, sizeTT, sizeTT)
      flatData.forEach(d => {
        var x = s * (d.i - x0patchTT)
        var y = s * (d.j - y0patchTT)

        if (x < -s || x > sizeTT || y < -s || y > sizeTT) return

        ctxTT.fillStyle = colors[d.ordered[0].i]
        ctxTT.fillRect(x, y, Math.ceil(s), Math.ceil(s))

        // Second rect size proportional to sum of two largest softmax values.
        var s2 = d.ordered[1].v/(d.ordered[0].v + d.ordered[1].v)

        ctxTT.fillStyle = colors[d.ordered[1].i]
        ctxTT.fillRect(x, y, s2*s, s2*s)
      })
    }

    return render
  }

  // Bar check to pick calibration 
  overlay2InitFn.quantitationSelect = () => {
    var {colors, ctx} = drawInfo

    var c = d3.conventions({
      sel: addCornerOverlay(400, 200),
      margin: {bottom: 20, left: 100, right: 50, top: 10},
    })

    var viewportSize = sandboxThis.viewportSize

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)
    var svg = addSVG()

    window.flatData = flatData

    var gp3Offsets =  [0.81, 0.852, 0.95, 0.955, 1, 1.03, 1.13, 1.15, 1.22, 1.3]

    flatData.forEach(dataCell => {
      dataCell.orderedOffset = gp3Offsets.map(offset => {
        return dataCell
          .map((v, j) => j == 1 ? v*offset : j == 2 ? v/offset : v)
          .map((v, i) => ({v, i}))
          .sort((a, b) => a.v < b.v ? 1 : -1)
      })
    })

    var data = gp3Offsets.map((gp3Offset, offsetIndex) => {

      var byPattern = calcByPattern(topology, d => d.properties.d.orderedOffset[offsetIndex][0].i)

      var {regionSel} = addRegionPaths(svg, byPattern, colors, true)

      var nonTumor = flatData.filter(d => d.orderedOffset[offsetIndex][0].i != 0)
      var gp3 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 1)*100
      var gp4 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 2)*100
      var gp5 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 3)*100

      return {byPattern, regionSel, gp3Offset, gp3, gp4, gp5}
    })

    var regionPathSel = svg.selectAll('.region')

    c.y.domain([2.5, 0])
    c.x.domain([0, 100])

    c.xAxis.tickValues([0, 25, 50, 75, 100]).tickSize(c.height).tickFormat(d => d + '%')
    d3.drawAxis(c)

    c.svg.selectAll('.axis')
      .translate(0, 0)
      .st({opacity: .4}).select('.domain').remove()
    c.svg.selectAll('.y').remove()

    var rows = [
      {name: 'gp3', color: '#0f0'},
      {name: 'gp4', color: '#ff0'},
      {name: 'gp5', color: '#f00'},
    ]

    var rowSel = c.svg.appendMany('g', rows)
      .translate((d, i) => c.y(i), 1)

    rowSel.append('rect')
      .at({width: 40, height: 40, fill: d => d.color, x: -c.margin.left + 5, stroke: '#000'})


    rowSel.append('text')
      .text(d => d.name.toUpperCase())
      .at({
        textAnchor: 'end',
        x: -20,
        y: 25
      })

    var boxHeight = 50
    var barHeight = boxHeight/data.length

    var barSel = rowSel.appendMany('rect', parent => data.map(d => ({parent, d, val: d[parent.name]})))
      .at({
        height: barHeight - 1,
        width: d => c.x(d.val),
        y: (d, i) => i*barHeight,
        fill: d => d.parent.color
      })


    rowSel.appendMany('rect', parent => data.map(d => ({parent, d, val: d[parent.name]})))
      .at({
        height: barHeight - 1,
        width: c.width,
        y: (d, i) => i*barHeight,
        opacity: 0,
      })
      .on('mouseover', d => setActive(d.d))


    var textSel = rowSel.append('text')
      .st({fill: '#f0f'})
      .translate([c.width + 10, 25])

    setActive(data[4])
    function setActive(d){
      textSel.text(e => Math.round(d[e.name]) + '%')

      barSel.st({stroke: e => e.d == d ? '#000' : '#999'})


      data.forEach(e => {
        e.regionSel.st({opacity: e == d ? 1 : 0})
      })
    }


    function render(){
      var {s, x0patch, y0patch} = drawInfo

      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return render
  }

  // Small multiples to pick quantation calibration
  overlay2InitFn.quantationSm = () => {
    var {colors, ctx} = drawInfo

    var divSel = addCornerOverlay(400, 205)


    var viewportSize = sandboxThis.viewportSize

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)
    var svg = addSVG()

    window.flatData = flatData

    var gp4Offsets =  [0.81, 0.852, 0.95, 0.955, 1, 1.5, 1.6, 1.8, 2.22].reverse()

    flatData.forEach(dataCell => {
      dataCell.orderedOffset = gp4Offsets.map(offset => {
        return dataCell
          .map((v, j) => j == 2 ? v*offset : j == 3 ? v/offset : v)
          .map((v, i) => ({v, i}))
          .sort((a, b) => a.v < b.v ? 1 : -1)
      })
    })

    var data = gp4Offsets.map((gp4Offset, offsetIndex) => {

      var byPattern = calcByPattern(topology, d => d.properties.d.orderedOffset[offsetIndex][0].i)

      var {regionSel} = addRegionPaths(svg, byPattern, colors, true)

      var nonTumor = flatData.filter(d => d.orderedOffset[offsetIndex][0].i != 0)
      var gp3 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 1)*100
      var gp4 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 2)*100
      var gp5 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 3)*100

      return {byPattern, regionSel, gp4Offset, gp3, gp4, gp5}
    })

    var regionPathSel = svg.selectAll('.region')

    var dataSel = divSel.appendMany('div', data.slice(0, 9))
      .st({
        width: 125,
        height: 60,
        marginBottom: -25,
        border: '1px solid #ccc',
        display: 'inline-block',
        margin: 3,
      })
      .each(drawChart)
      .on('mouseover', setActive)

    function drawChart(data){
      var svg = d3.select(this).append('svg')
        .at({width: 80, height: 55})
        .st({overflow: 'visible'})
        .append('g').translate([63, 10])

      var bh = 10

      var rows = [
        {pat: 3, name: 'gp3', color: colors[1]},
        {pat: 4, name: 'gp4', color: colors[2]},
        {pat: 5, name: 'gp5', color: colors[3]},
      ]

      rows.forEach(d => d.v = data[d.name])

      var rowSel = svg.appendMany('g', rows)
        .translate((d, i) => (bh + 10)*i, 1)

      rowSel.append('text')
        .text(d => Math.round(d.v) + '% ' + d.pat)
        .at({
          textAnchor: 'end',
          dy: '.33em',
          x: -10,
          fontSize: 13,
          fontFamily: 'monospace',
          fontWeight: 200,
          fill: '#333',
        })

      rowSel.append('rect')
        .at({
          x: -5,
          y: -4.5,
          width: d => Math.round(70*d.v/100),
          height: bh,
          fill: d => d.color,
          stroke: '#555',
        })
    }

    setActive(data[4])
    function setActive(d){
      dataSel.st({
        borderColor: e => d == e ? '#000' : '#ddd',
      })

      data.forEach(e => {
        e.regionSel.st({opacity: e == d ? 1 : 0})
      })
    }


    function render(){
      var {s, x0patch, y0patch} = drawInfo

      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return render
  }

  // Group calibrations by Gleason Grade
  overlay2InitFn.quantationGrade = () => {
    var {colors, ctx} = drawInfo

    var divSel = addCornerOverlay(300, 110)

    var viewportSize = sandboxThis.viewportSize

    var flatData = sandboxThis.flatData
    var topology = calcTopology(flatData)
    var svg = addSVG()

    window.flatData = flatData

    var gp4Offsets =  [0.81, 0.852, 0.95, 0.955, 1, 1.5, 1.6, 1.8, 2.22].reverse()

    flatData.forEach(dataCell => {
      dataCell.orderedOffset = gp4Offsets.map(offset => {
        return dataCell
          .map((v, j) => j == 2 ? v*offset : j == 3 ? v/offset : v)
          .map((v, i) => ({v, i}))
          .sort((a, b) => a.v < b.v ? 1 : -1)
      })
    })

    var data = gp4Offsets.map((gp3Offset, offsetIndex) => {

      var byPattern = calcByPattern(topology, d => d.properties.d.orderedOffset[offsetIndex][0].i)

      var {regionSel} = addRegionPaths(svg, byPattern, colors, true)

      var nonTumor = flatData.filter(d => d.orderedOffset[offsetIndex][0].i != 0)
      var gp3 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 1)*100
      var gp4 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 2)*100
      var gp5 = d3.mean(nonTumor, d => d.orderedOffset[offsetIndex][0].i == 3)*100

      var benign = nonTumor.length/flatData.length*100

      return {byPattern, regionSel, gp3Offset, gp3, gp4, gp5, benign}
    })

    var regionPathSel = svg.selectAll('.region')

    data.sort(d3.ascendingKey('gp3'))

    byGrade = d3.nestBy(data, d => d.gp4 > 50 ? '4 + 5' : '5 + 4')

    var dataSel = divSel.appendMany('div', byGrade)
      .st({
        height: 50,
        // border: '1px solid #ccc',
        margin: 3,
      })
      .each(drawChart)

    function drawChart(data){
      var sel = d3.select(this)

      sel.append('div').append('b').text(data.key)

      var svg = d3.select(this).append('svg')
        .at({width: 80, height: 40})
        .st({overflow: 'visible'})
        // .append('g').translate([63, 10])

      var bw = 40
      var bh = 20

      var boxSel = svg.appendMany('g', data)
        .translate((d, i) => i*(bw + 10), 0)
        .on('mouseover', setActive)

      boxSel.append('rect.outline')
        .at({
          width: bw,
          height: bh,
          stroke: '#000',
        })

      boxSel.append('rect')
        .at({
          width: bw,
          height: bh,
          fill: colors[3]
        })

      boxSel.append('rect')
        .at({
          width: d => (d.gp3 + d.gp4)/100*bw,
          height: bh,
          fill: colors[2]
        })

      boxSel.append('rect')
        .at({
          width: d => (d.gp3 )/100*bw,
          height: bh,
          fill: colors[1]
        })

      boxSel.append('rect')
        .at({
          width: bw,
          height: d => d.benign/100*bh,
          fill: '#ccc'
        })
    }

    setActive(data[4])
    function setActive(d){
      dataSel.selectAll('.outline').st({
        strokeWidth: e => d == e ? 2 : .5,
      })

      data.forEach(e => {
        e.regionSel.st({opacity: e == d ? 1 : 0})
      })
    }

    function render(){
      var {s, x0patch, y0patch} = drawInfo

      var path = getZoomedGeoPath(s, x0patch, y0patch)
      regionPathSel.at({d: d=> path(d.mesh)})
    }

    return render
  }

  function resetSandbox(){
    // Remove DOM node and event listeners.
    sel.selectAll('.sandbox-generated').remove();
    sel.select('.mc-interactions-layer').on('mousemove', function(){});

    ctx.clearRect(0, 0, innerWidth, innerHeight)

    // Toggle confidence with "O".
    d3.select(window).on('keydown', function(){
      if (String.fromCharCode(event.keyCode).toLowerCase() !== 'o') return;

      var isVisible = d3.select('.sandbox-layer-canvas').style('opacity');

      d3.selectAll('.sandbox-layer-canvas,.sandbox-generated')
        .st({opacity: +!+isVisible});
    });
  }
  resetSandbox()

  // Create overlays with argmax region background
  d3.keys(overlay2InitFn).forEach(str => {
    overlay2InitFn[str + 'TOP'] = function(){
      var topFn = overlay2InitFn.topRegion()
      var fn = overlay2InitFn[str]()

      return () => {
        topFn()
        fn()
      }
    }
  })

  return overlay2InitFn[sandboxThis.sandboxOverlay]()
}




if (window.initGraphs){
  d3.selectAll('.sandbox-graph').each(d => {
    d.sandboxFn = initSandbox(d.sel, d.sandboxThis, d.ctx, d.drawInfo, true)
    d.sandboxFn()
  })
}









