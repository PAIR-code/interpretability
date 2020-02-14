# Copyright 2020 Google LLC. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# dissolve shore
mapshaper-xl raw/nycg.shp \
  -dissolve2 \
  -o temp/shore.shp

# calculate bounding box of nyc
# mapshaper temp/shore.shp -info
# // 913175.1090087891,120121.8812543377,1067382.5084228516,272844.29400634766

# dissolve, simplify and project buildings
mapshaper-xl raw/buildings.geojson \
  -drop target=2 \
  -proj match=raw/nycg.prj \
  -clip bbox2=913175.1090087891,120121.8812543377,1067382.5084228516,272844.29400634766 \
  -dissolve2 \
  -simplify resolution=4000 \
  -o format=geojson temp/buildings-simple-projected.json

node ../bin/merge.js

# project and clip neighborhoods
mapshaper-xl raw/neighborhoods.json \
  -proj match=raw/nycg.prj \
  -clip bbox2=913175.1090087891,120121.8812543377,1067382.5084228516,272844.29400634766 \
  -each 'this.properties.centroidX = this.centroidX' \
  -each 'this.properties.centroidY = this.centroidY' \
  -o temp/neighborhoods-projected.json

node ../bin/calc-colors.js

# this is silly... 
# but couldn't figure out how to align buildings and neighborhoods w/o copy/paste

mapshaper-xl -i \
    temp/shore.shp \
    temp/buildings-simple-projected.json \
    temp/neighborhoods-projected.json \
    temp/neighborhoods-centroids.csv \
    temp/neighborhoods-centroids.csv \
  combine-files \
  -target 1 \
  -style fill='#f3f3f3' stroke='none' stroke-width=.1 \
  -target 2 \
  -style fill='#d3d3d3' \
  -target 3 \
  -style fill='none' stroke='calcStroke' opacity='calcOpacity*.5' stroke-width=0 \
  -target 4 \
  -points x=x y=y \
  -style  font-size=5 dy=dy dx=dx text-anchor=middle font-family=monospace \
          label-text=place fill=calcStroke opacity=0 stroke='#fff' stroke-width=.8 \
  -target 5 \
  -points x=x y=y \
  -style  font-size=5 dy=dy dx=dx text-anchor=middle font-family=monospace \
          label-text=place fill=calcStroke opacity=0 \
  -o temp/buildings.svg target=1,2,3,4,5 width=6000

svgexport temp/buildings.svg final/buildings.png 1x

mapshaper-xl -i \
    temp/shore.shp \
    temp/buildings-simple-projected.json \
    temp/neighborhoods-projected.json \
    temp/neighborhoods-centroids.csv \
    temp/neighborhoods-centroids.csv \
  combine-files \
  -target 1 \
  -style fill='none' stroke='none' stroke-width=.1 \
  -target 2 \
  -style fill='#ccc' opacity=0 \
  -target 3 \
  -style fill='none' stroke='calcStroke' opacity='calcOpacity*2' stroke-width=.5 class='filename' \
  -target 4 \
  -points x=x y=y \
  -style  font-size=5 dy=dy dx=dx text-anchor=middle font-family=monospace \
          label-text=place fill=calcStroke opacity=0 class='filename' stroke='#fff' stroke-width=.8 \
  -target 5 \
  -points x=x y=y \
  -style  font-size=5 dy=dy dx=dx text-anchor=middle font-family=monospace \
          label-text=place fill=calcStroke opacity=0 class='filename' \
  -o temp/outlines.svg target=1,2,3,4,5 width=6000

svgexport temp/outlines.svg final/outlines.png 1x

node ../bin/label-svg.js