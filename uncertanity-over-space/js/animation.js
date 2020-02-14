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


function offscreenPause(node, timer){
  if (!window.IntersectionObserver) return

  var observer = new IntersectionObserver((entries, observer) => {
    timer.paused = !entries[0].isIntersecting
  })

  observer.observe(node)
}



function drawHOP(){
  var sel = d3.select('.hop').html('').append('div')
  var s = 5
  
  var c = d3.conventions({
    sel,
    width:  (d3.max(tidy, d => d.i) + 1)*s,
    height: (d3.max(tidy, d => d.j) + 1)*s,
    margin: {left: 0, right: 0, top: 0, bottom: 0},
    layers: 'c',
  })

  var ctx = c.layers[0]

  if (window.flickerTimer) window.flickerTimer.stop()
  window.flickerTimer = d3.interval(t => {
    if (flickerTimer.paused) return

    tidy.forEach(d =>{
      var r = Math.random()
      var prev = 0
      d.forEach((v, i) => {
        if (r < prev) return

        prev += v
        if (prev < r) return

        ctx.beginPath()
        ctx.fillStyle = colors[i]

        ctx.rect(d.i*s, d.j*s, s, s)
        ctx.fill()
      })
    })
  }, 250)

  offscreenPause(sel.node(), flickerTimer)
}



function drawParticle(){
  var sel = d3.select('.particle').html('').append('div')
  var s = 5

  var c = d3.conventions({
    sel,
    width:  (d3.max(tidy, d => d.i) + 1)*s,
    height: (d3.max(tidy, d => d.j) + 1)*s,
    margin: {left: 0, right: 0, top: 0, bottom: 0},
    layers: 'c',
  })

  var ctx = c.layers[0]
  
  window.particles = []
  
  function addParticles(t){
    var chance = .15
    
    tidy.forEach(d =>{
      if (Math.random() > chance) return
      
      var r = Math.random()
      var prev = 0
      d.forEach((v, i) => {
        if (r < prev) return

        prev += v
        if (prev < r) return
        
        var x0 = d.i*s + Math.random()*s
        var y0 = d.j*s + Math.random()*s
        var dx = 0
        var dy = 0
        var color = colors[i]
        
        if (i == 0){ dx = 1; y0 += Math.random()*0 }
        if (i == 1){ dy = 1; x0 += Math.random()*0 }
        if (i == 2){ dx = -1; x0 += s; y0 += Math.random()*0  }
        if (i == 3){ dy = -1; y0 += s; x0 += Math.random()*0 }
        
        particles.push({x0, y0, dx, dy, color, t})
      })
    })
  }
  
  addParticles(0)

  var t = 0
  if (window.particleTimer) window.particleTimer.stop()
  window.particleTimer = d3.timer(() => {
    if (particleTimer.paused) return

    ctx.fillStyle = 'rgba(255,255,255, .1)'
    ctx.fillRect(0, 0, c.width, c.height)
    
    particles.forEach(d => {
      ctx.beginPath()
      ctx.fillStyle = d.color
      
      d.dt = (t - d.t)/100
      ctx.rect(d.x0 + d.dt*d.dx, d.y0 + d.dt*d.dy, 1, 1)
      ctx.fill()
    })
    
    particles = particles.filter(d => d.dt < 5)
    addParticles(t)
    particles = particles.slice(-20000)

    t += 30
  })

  offscreenPause(sel.node(), particleTimer)


}


function initAnimation(){
  drawHOP()
  drawParticle()
}

if (window.tidy) initAnimation()








