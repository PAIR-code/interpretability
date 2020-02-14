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
var Delauny = (require('d3-delaunay')).Delaunay

var colors = '#012394 #FC4B16 #12852D #FBC20F #E71E24 #12852D #A9159C'

var colors = '#012394 #865327 #FBC20F #E71E24 #12852D #A9159C'
var colors = '#012394 #E2792F #865327 #E71E24 #12852D #A9159C'


var colors = '#012394 #865327 #FBC20F #E71E24 #12852D #A9159C'

var moreColors = ' #C27D07 #118FD8'
// colors = colors + moreColors
colors = colors.split(' ')

var color = d3.scaleOrdinal(colors)

var dir = __dirname + '/../basemap/temp/'

var all = io.readDataSync(dir + 'neighborhoods-projected.json')

all.features = all.features
  .filter(d => d.properties.neighborhoodLive != 'Other')
  .filter(d => d.properties.neighborhoodLive != 'Midtown South')
  .filter(d => d.properties.neighborhoodLive != 'Meatpacking District')
  .filter(d => d.properties.neighborhoodLive != 'Williamsbridge')
  .filter(d => d.properties.neighborhoodLive != 'Civic Center')
  .filter(d => d.properties.neighborhoodLive != 'South Street Seaport')


var byPlace = jp.nestBy(all.features, d => d.properties.neighborhoodLive)
byPlace.forEach(neighborhood => {
    var bbox = [
      913175.1090087891,
      120121.8812543377,
      1067382.5084228516,
      272844.29400634766
    ]
    var interiorPoints = neighborhood.filter(d => {
      var x = d.properties.centroidX
      var y = d.properties.centroidY

      return bbox[0] < x && bbox[1] < y && bbox[2] > x && bbox[3] > y
    })
    // console.log(neighborhood.length, interiorPoints.length)
    neighborhood.x = d3.mean(interiorPoints, d => d.properties.centroidX)
    neighborhood.y = d3.mean(interiorPoints, d => d.properties.centroidY)


    neighborhood.print = neighborhood.key
      .replace('Times Square/ Theater District', 'Times Square')
      .replace('Meatpacking District', 'Meatpacking')
      .replace(`Hell's Kitchen / Clinton`, `Hell's Kitchen`)
      .replace('Columbia Street Waterfront District', 'Columbia Street')
      .replace('(Staten Island)', '')

    neighborhood.filename = neighborhood.key.replace(/[^a-z0-9]/gi, '_').toLowerCase()

    neighborhood.isRemove = neighborhood.length < 6

    neighborhood.forEach((d, i) => {
      d.properties.neighborhoodLength = neighborhood.length
      d.properties.isRemove = neighborhood.isRemove
      d.properties.filename = neighborhood.filename
     
      d.properties.calcStroke = color(d.properties.neighborhoodLive)
      d.properties.calcOpacity = jp.clamp(.05, 50/neighborhood.length, .3)
    })
  })

byPlace = byPlace.filter(d => !d.isRemove)

byPlace.forEach((d, i) => {
  d.i = i
})

byPlace = _.sortBy(byPlace, d => d.key)
byPlace = _.sortBy(byPlace, d => d.length).reverse()

var place2index = {}
byPlace.forEach((d, i) => place2index[d.key] = i)

var pairs = [
  ['Upper West Side', 'Lincoln Square'],
  ['Upper West Side', 'Columbus Circle'],
  ['Upper West Side', "Hell's Kitchen / Clinton"],
  ['Upper West Side', 'Manhattan Valley'],
  ['Upper West Side', 'Morningside Heights'],
  ['Upper West Side', 'Central Harlem'],
  ['Murray Hill', 'Turtle Bay'],
  ['Lower East Side', 'Little Italy'],
  ['Brooklyn Heights', 'Boerum Hill'],
  ['Midwood', 'Sheepshead Bay'],
  ['East New York', 'Ozone Park'],
  ['Bensonhurst', 'Sheepshead Bay'],
]

var neighborOverrides = {}
pairs.forEach(([a, b]) => {
  if (!neighborOverrides[a]) neighborOverrides[a] = []
  neighborOverrides[a].push(place2index[b])

  if (!neighborOverrides[b]) neighborOverrides[b] = []
  neighborOverrides[b].push(place2index[a])
})

var delauny = Delauny.from(byPlace, d => d.x, d => d.y)

byPlace.forEach((d, i) => {
  var takenColors = []
  var neighbors = Array.from(delauny.neighbors(i))
    .concat(neighborOverrides[d.key] || [])

  neighbors.forEach(j => {
    takenColors[byPlace[j].colorIndex] = true
  })

  d.colorIndex = d3.range(i, i + colors.length)
    .map(d => d % colors.length)
    .filter(d => !takenColors[d])[0]

  d.calcStroke = colors[d.colorIndex]

  if (!d.calcStroke){
    d.calcStroke = '#444'
  }

  d.forEach(e => e.properties.calcStroke = d.calcStroke)
})

byPlace = _.sortBy(byPlace, d => d.length).reverse()


var dyOffset = {
  'South Street Seaport': 6,
  'DUMBO': 10,
  'Midtown': -3,
  'Greenridge': -6,
}
var dxOffset = {
}


all.features = all.features.filter(d => !d.properties.isRemove)
all.features = _.sortBy(all.features, d => d.properties.properties)
all.features = _.shuffle(all.features)

io.writeDataSync(dir + 'neighborhoods-projected.json', all)
io.writeDataSync(dir + 'neighborhoods-centroids.csv', byPlace.map(d => {
  return {
    x: d.x, 
    y: d.y, 
    dy: dyOffset[d.print] || 0,
    dx: dxOffset[d.print] || 0,
    place: d.print.replace('&', '&amp;'), 
    filename: d.filename,
    count: d.length, 
    calcOpacity: d[0].properties.calcOpacity,
    calcStroke: d[0].properties.calcStroke//.replace('FBC20F', 'E2792F'),
  }
}))

