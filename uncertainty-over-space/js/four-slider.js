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




!(function(){
  var rootSel = d3.select('.four-slider').html('').append('div')

  var softmax = [.01, .25, .2, .5].map((d, i) => {
    return {v: d, i, orig: d}
  })

  var updateVec = (function(){
    var sel = rootSel.append('div.vec-container').append('div')
    sel.append('div.pointer').append('div')

    sel.st({fontSize: 14}).st({position: 'relative', left: 0})
    sel.append('span').text('[')

    var width = 31
    var height = 24

    var numSel = sel.appendMany('span', softmax)

    var svgSel = numSel
      .append('div').st({display: 'inline-block', position: 'relative', width, height}) 
      .append('div.vec-text')
      .parent()
      .append('svg')
      .at({width, height})
      .st({position: 'absolute', zIndex: -1000 })
      .lower()

    var drag = d3.drag()
      .on('drag', function(d){
        d.v = d3.clamp(.01, 1 - d3.mouse(this)[1]/height, .99)
        dt = 0

        updateAll()
      })

    numSel.call(drag)

    var textSel = sel.selectAll('.vec-text').st({pointerEvents: 'none'})

    svgSel.append('rect')
      .at({width, height, fill: (d, i) => colors[i], fillOpacity: .3})

    var rectSel = svgSel.append('rect')
      .at({width, height: d => Math.max(1, d.v*height), y: d => height - d.v*height, fill: (d, i) => colors[i]})


    numSel.append('span').text((d, i) => i == 3 ? '' : ',')
      .st({position: 'relative', left: -2})

    sel.append('span').text(']')
      .st({position: 'relative', left: 0})

    return () => {
      textSel.text(d => {
        var str = ('' + d3.clamp(0.01, Math.round(d.normalized*100)/100, .99)).replace('0.', '.')
        if (str.length == 2) str = str + '0'

        return str
      })

      rectSel.at({
          height: d => Math.max(1, d.v*height), 
          y: d => height - d.v*height, 
        })
    }


  })()


  var s = 105

  var key2string = {
    argmaxColor: 'Argmax Tint',
    topTwoColor: 'Top Two Color',
    stacked: 'Stacked Bar',
    argmaxSize: 'Argmax Size',
    topTwoSize: 'Top Two Size',
    roundedSorted: 'Rounded',
  }

  var smSel = rootSel.append('div.patch-types')

  var updatePatchFns = d3.entries(key2string).map(({key, value}) => {
    var sel = smSel.append('div').st({marginBottom: 20})

    var c = d3.conventions({
      sel: sel.append('div'),
      width: s,
      height: s,
      margin: {left: 0, right: 0, top: 0, bottom: 0},
      layers: 'c',
    })

    sel.append('b').text(value)


    return datum => {
      c.layers[0].clearRect(0, 0, s, s)
      cellRenders[key](datum, c.layers[0], s, colors)
    }
  })


  // var updateSize = (function(){
  //   var c = d3.conventions({
  //     sel: rootSel.append('div'),
  //     width: s,
  //     height: s,
  //     margin: {left: 0, right: 0, top: 0, bottom: 0},
  //     layers: 'c',
  //   })

  //   return datum => {
  //     cellRenders.topTwoSize(datum, c.layers[0], s, colors)
  //   }
  // })()

  // var updateColor = (function(){
  //   var c = d3.conventions({
  //     sel: rootSel.append('div'),
  //     width: s,
  //     height: s,
  //     margin: {left: 0, right: 0, top: 0, bottom: 0},
  //     layers: 'c',
  //   })

  //   return datum => {
  //     cellRenders.topTwoColor(datum, c.layers[0], s, colors)
  //   }
  // })()

  var weight = .2
  var dt = .01
  function updateAll(){
    if (fourTimer.paused) return

    weight += dt
    if (weight < 0.2 || weight > 5) dt *= -1

    if (dt){
      softmax.forEach(d => d.v = d.orig)
      softmax[2].v = Math.max(.01, softmax[2].v*weight)
    }
    var sum = d3.sum(softmax, d => d.v)
    softmax.forEach(d => d.normalized = d.v/sum)

    var datum = softmax.map(d => d.normalized)
    datum.ordered = datum
      .map((d, i) => ({v: d, i}))
      .sort((a, b) => a.v < b.v ? 1 : -1)
    datum.i = 0
    datum.j = 0

    updateVec()
    updatePatchFns.forEach(fn => fn(datum))
  }


  if (window.fourTimer) window.fourTimer.stop()
  window.fourTimer = d3.timer(updateAll)

  updateAll(0)

  offscreenPause(rootSel.node(), fourTimer)




  function offscreenPause(node, timer){
    if (!window.IntersectionObserver) return

    var observer = new IntersectionObserver((entries, observer) => {
      timer.paused = !entries[0].isIntersecting
    })
    observer.observe(node)
  }












})()
