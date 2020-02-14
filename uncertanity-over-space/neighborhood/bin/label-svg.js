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

var inDir = __dirname + '/../basemap/temp'
var ourDir = __dirname + '/../basemap/final'
var svg = fs.readFileSync(inDir + '/outlines.svg', 'utf8')

var lines = svg.split('\n')

var labelLines = lines
  .filter(d => !d.includes('<path '))
  .map(d => d.replace(`opacity="0"`, `opacity="1"`))
  // .map(d => d.replace(`font-size="5" `, `font-size="15" vector-effect="non-scaling-stroke" `))
  .map(d => d.replace(`font-size="5" `, `font-size="15" `))

fs.writeFileSync(ourDir + '/labels.svg', labelLines.join('\n'))


var outlines = lines
  .filter(d => d.includes('class'))
  .filter(d => !d.includes('text'))
  .map(d => d.replace('stroke-width="0.5"', 'stroke-width="1"'))

jp.nestBy(outlines, d => d.split('class="')[1].split('"')[0])
  .forEach(neighborhood => {
    var pre = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="6000" height="5918" viewBox="0 0 6000 5918" stroke-linecap="round" stroke-linejoin="round">`

    var post = `</svg>`

    fs.writeFileSync(`${ourDir}/split/${neighborhood.key}.svg`, pre + neighborhood.join('\n') + post)
  })





