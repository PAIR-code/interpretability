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



var {_, cheerio, d3, jp, fs, glob, io, queue, request} = require('scrape-stl')

var outDir = __dirname + '/../basemap/final/sunnyside-square.json'
var all = io.readDataSync(__dirname + '/../basemap/raw/west-queens.json')


var p0 = [-73.93861055374144, 40.76854794448262]
var p1 = [-73.90419244766234, 40.73636308365653]

var ncol = 200
var s = (p1[0] - p0[0])/ncol
var nrow = Math.round((p0[1] - p1[1])/s)
var nrow = ncol


byNeighborhood = jp.nestBy(all.features, d => d.properties.neighborhoodLive)
byNeighborhood.forEach(neighborhood => {
  var polygons = neighborhood
    .map(d => d.geometry.coordinates[0])
    // .slice(0, 500)

  neighborhood.grid = d3.cross(d3.range(ncol), d3.range(nrow)).map(([i, j])=> {
    var point = [p0[0] + s*i, p0[1] - s*j]

    return d3.mean(polygons, polygon => d3.polygonContains(polygon, point))
  })

  neighborhood.grid = neighborhood.grid.map(d => Math.round(d*100))
})


var out = {p0, p1, ncol, nrow, s}
out.neighborhoods = byNeighborhood.map(d => ({key: d.key, grid: d.grid}))

if (s == 50){
  io.writeDataSync(outDir + '/grid-small.json', out)
} else {
  io.writeDataSync(outDir + '/grid-big.json', out)
}

