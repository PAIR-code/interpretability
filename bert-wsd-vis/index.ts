
/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as d3 from 'd3';
import * as jp from 'd3-jetpack';

import {WordSelectorDropdown} from './dropdown';
import {POS, POSTag} from './pos';
import * as util from './util';

declare var math: any;


export interface SentData {
  sentence: string;
  pos: string;
}

export interface Point {
  sentenceLabel: string;
  coords: number[][];
  isSelected: boolean;
  pos: string;
  color?: string;
  highlight?: boolean;
  currLabelWord?: string;
  wordHash: {[word: string]: boolean};
}

export interface Label {
  word: string;
  count: number;
  coords: number[];
  visible: boolean;
}

interface KNN {
  /** Positions of each point, per layer. */
  data: number[][][];
  /** Labels of each point. */
  labels: SentData[];
}

export class BertVis {
  // Height and width of the display.
  private rightOffset = 200;
  private width = window.innerWidth;
  private height = window.innerHeight;

  // UI elements.
  private layerDropdown = d3.select('#dropdown');
  private posSwitch = d3.select('#pos-switch');
  private posLegend = d3.select('#legend');

  // D3 selections of svg objects.
  private dotsSVG: d3.Selection<SVGCircleElement, Point, SVGSVGElement, {}>;
  private labelsSVG: d3.Selection<SVGTextElement, Label, d3.BaseType, {}>;

  // Information about the points and their locations.
  private labels: Label[];
  private labelWordCoords: {[word: string]: number[]};
  private data: Point[];
  private posKeys: string[] = POS.map((pos: POSTag) => pos.tag);

  // State variables.
  private word: string;
  private transform: d3.ZoomTransform;
  private showPOS: boolean;
  private currLayer = 11;
  private subsearchWord: string;

  constructor() {}
  async start() {
    this.addHandlers();
    await this.loadWords();
    const urlWord = util.getURLWord();
    this.getData(urlWord ? urlWord : 'lie');
  }

  private addHandlers() {
    // Change the layer.
    this.layerDropdown.on('change', () => {
      const layer = (this.layerDropdown.node() as HTMLInputElement).value;
      if (this.data != null) {
        this.updateLayer(parseInt(layer));
      }
    });

    // Show or hide POS.
    this.posSwitch.on('change', () => {
      this.showPOS = (this.posSwitch.node() as HTMLInputElement).checked;
      this.refresh();
    });

    // Expand or hide info text.
    const infoText = d3.select('#info');
    const expandButton = d3.select('#expand');
    let closed = false;
    expandButton.on('click', () => {
      closed = !closed;
      infoText.classed('closed', closed);
      expandButton.html(closed ? 'expand_less' : 'expand_more')
    });

    // Also start out with infotext closed, if on mobile.
    if (util.isMobile()) {
      closed = true;
      infoText.classed('closed', true);
    }
  }

  /**
   * Recreates the legend to include the currently-used parts of speech.
   */
  private updatePOSLegend() {
    this.posLegend.html('');
    this.posLegend.classed('hidden', true);
    if (this.showPOS && this.data) {
      const poses = util.getUsedPoses(this.data);
      const legendLabels = this.posLegend.selectAll('div')
                               .data(poses)
                               .enter()
                               .append('div')
                               .classed('legend-item', true);
      legendLabels.append('div')
          .classed('legend-dot', true)
          .style('background-color', d => {
            return this.posColor(d.tag);
          });
      legendLabels.append('div').text(d => d.description);
      this.posLegend.classed('hidden', false);
    }
  }

  /**
   * Loads the words that are used in the dropdown.
   */
  private async loadWords() {
    const url = 'filtered_words.json';
    const errorMessage = 'Could not load word dictionary.';
    const words = await util.loadJson(url, errorMessage) as string[];
    const parent = d3.select('#words-selector');
    new WordSelectorDropdown(
        words, parent, async (word) => await this.getData(word));
    return words;
  }

  /**
   * Send a request to the server to get the BERT embeddings and neighbors.
   * @param word Word to get sentences with.
   */
  private async getData(word: string) {
    this.setLoadingState();
    this.word = word;
    const url = `jsons/${word}.json`;
    const errorMessage =
        'Whoops! An error occurred. If you entered a word, it may not be in the dictionary.';
    const res = await util.loadJson(url, errorMessage) as KNN;
    util.setURLWord(word);
    this.data = [];

    res.data =
        util.centerFrame(res.data, this.width, this.height, this.rightOffset);

    // Transpose the data to be by point rather than by layer.
    const coordsByPoint = util.transpose(res.data);

    // Make an object for each point.
    for (let i = 0; i < res.labels.length; i++) {
      let sentenceLabel = res.labels[i].sentence;

      sentenceLabel = sentenceLabel.replace(/\s\s+/g, ' ');
      sentenceLabel = sentenceLabel.toLowerCase();
      const pos = res.labels[i].pos;
      const coords = coordsByPoint[i];
      const isSelected = false;
      const currLabelWord = '';
      const point = {sentenceLabel, coords, isSelected, pos, currLabelWord};
      this.data.push(point);
    }

    this.makeDiagramUMAP();
    this.makeDescLabelsFromScratch();
    this.refresh();
  }

  /**
   * Make the description words. This includes finding all words in all labels,
   * figuring out which could be descriptions, and filtering out those that
   * should be shown at this zoom level.
   */
  private makeDescLabelsFromScratch() {
    this.labelWordCoords = util.getAllWordsInLabels(this.data, this.word);
    this.determineDescriptionLabels();
    this.showDescriptionLabels();
  }

  private async determineDescriptionLabels() {
    // Add a dropdown to search within the sentences.
    const callback = (word: string) => {
      this.subsearchWord = word;
      this.highlightDotsWWord(word, true)
    };
    const subsearch = new WordSelectorDropdown(
        Object.keys(this.labelWordCoords), d3.select('#search-in-sentences'),
        callback, callback, 'Search within results');
    subsearch.hideButton();

    this.labels = [];
    const allLabelWords = Object.keys(this.labelWordCoords);
    for (let i = 0; i < allLabelWords.length; i++) {
      const word = allLabelWords[i];
      const allCoords = this.labelWordCoords[word];
      const count = allCoords.length;

      // Iterate through all words that have enough instances
      if (count > 5 && word != this.word) {
        const lastLayerCoords = util.transpose(allCoords)[this.currLayer];
        const intraPtDists = this.getIntraPtDists(lastLayerCoords);
        const sortedIntraPtDists = intraPtDists.slice().sort((a, b) => a - b);

        // Figure out whether this is enough of a cluster to be labeled.
        // This is basically getting the median (ish) interpoint distance, and
        // seeing if it's below a threshold.
        let visible, spread;
        const maxSpread = this.width / 20;
        if (count < 20) {
          const cutoffPoint = sortedIntraPtDists.length * 1 / 2;
          spread = sortedIntraPtDists[Math.floor(cutoffPoint)];
          visible = spread < maxSpread;
        } else {
          const cutoffPoint = sortedIntraPtDists.length * 1 / 4;
          spread = sortedIntraPtDists[Math.floor(cutoffPoint)];
          visible = spread < maxSpread * 1.5;
        }

        // If it is, add it to the labels.
        if (visible) {
          const coords = this.getCoords(intraPtDists, count, allCoords);
          this.labels.push({word, count, coords, visible});
        }
      }
    };
    this.labels.sort((a, b) => b.count - a.count);
  }


  /**
   * Get the coordinates for a given label, weighted toward its main cluster.
   */
  private getCoords(
      intraPtDists: number[], numPts: number, allPtCoords: number[]) {
    const avgDistsToOtherPts: number[] = [];

    // For each point, get the average distance to all other points.
    for (let j = 0; j < intraPtDists.length; j += numPts) {
      const distsToOtherPts = intraPtDists.slice(j, j + numPts);
      const avgDistToOtherPts = math.mean(distsToOtherPts);
      avgDistsToOtherPts.push(avgDistToOtherPts);
    }

    // Only save
    let sortedDists = avgDistsToOtherPts.slice().sort((a, b) => a - b);
    sortedDists = sortedDists.slice(0, Math.ceil(numPts / 8));
    let coords: number[] = [];
    sortedDists.forEach(dist => {
      const idx = avgDistsToOtherPts.indexOf(dist);
      coords.push(allPtCoords[idx]);
    });

    // Take the mean over all remaining points.
    coords = math.mean(coords, 0);
    return coords;
  }


  private getIntraPtDists(pts: number[]) {
    let intraPtDists: number[] = [];
    pts.forEach((pt0: any) => {
      pts.forEach((pt1: any) => {
        intraPtDists.push(util.dist(pt0, pt1));
      });
    });
    return intraPtDists;
  }


  /**
   * Sets the visibility (in logic, not UI) of the overlappign labels.
   */
  private hideOverlappingLabels() {
    this.resetDotColors();
    const svg = d3.select('#diagram svg');
    svg.selectAll('text').remove();
    const svgNode = svg.node() as SVGSVGElement;


    // Filter out the words that are overlapping
    const renderedWordBboxes = [];
    for (let i = 0; i < this.labels.length; i++) {
      const d = this.labels[i];
      const text = svg.append('text')
                       .text(d.word)
                       .attr('font-size', util.fontSize(d))
                       .attr('x', this.transform.applyX(this.x(d)))
                       .attr('y', this.transform.applyY(this.y(d)));


      // Check whether this new box intersects with anything.
      let intersects = false;
      renderedWordBboxes.forEach((bbox) => {
        const intersectsThisBox =
            (svgNode.checkIntersection(text.node(), bbox));
        intersects = intersects || intersectsThisBox;
      });
      renderedWordBboxes.push(text.node().getBBox());
      if (intersects) {
        text.remove();
      }
      d.visible = !intersects;
    }

    // Remove all the boxes we added.
    svg.selectAll('text').remove();
  }

  /**
   * Show the large labels.
   */
  private showDescriptionLabels() {
    this.hideOverlappingLabels();

    // Color the dots with their label colors.
    this.labels.forEach((wordObj: any) => {
      if (wordObj.visible) {
        this.colorDotsWWord(wordObj.word);
      }
    });

    // Actually add all the words.
    const svg = d3.select('#diagram svg');
    this.labelsSVG =
        svg.selectAll('text').data(this.labels).enter().append('text');

    this.labelsSVG.text(d => d.word)
        .attr('visibility', d => d.visible ? 'visible' : 'hidden')
        .style('pointer-events', 'none')
        .attr('font-size', d => util.fontSize(d))
        .attr('fill', (d) => this.descColor(d.word))
        .classed('description', true)
        .attr('transform', (d) => `translate(${this.x(d)}, ${this.y(d)})`);
  }

  /**
   * Highlight the dots whose labels include the word.
   */
  private highlightDotsWWord(word: string, alsoSelect = false) {
    // If the word includes the search string, highlight it.
    this.data.forEach((d) => {
      const words = util.labelToWordsSet(d.sentenceLabel, this.word, false);
      const isSubsearched =
          this.subsearchWord != '' && (words.includes(this.subsearchWord));
      const isHighlighted = word != '' && words.includes(word);
      d.highlight = isSubsearched || isHighlighted;
      if (alsoSelect) {
        d.isSelected = isSubsearched || isHighlighted;
      }
    });
    this.refresh();
  }

  /**
   * Color the dots whose labels include the word.
   */
  private colorDotsWWord(word: string) {
    // If the word includes the search string, highlight it.
    this.data.forEach((d) => {
      // cache word tokenization
      if (!d.wordHash) {
        d.wordHash = {};
        util.labelToWordsSet(d.sentenceLabel, this.word, false)
            .forEach(word => d.wordHash[word] = true)
      }

      if (d.wordHash[word]) {
        d.color = this.descColor(word, false);
        d.currLabelWord = word;
      }
    });
  }

  /**
   * Reset all dot colors.
   */
  private resetDotColors() {
    this.data.forEach(d => {
      delete d.color;
      delete d.currLabelWord;
    });
  }

  /**
   * Apply the current view transform.
   */
  private applyCurrTransform(d: any) {
    const x = this.transform.applyX(this.x(d));
    const y = this.transform.applyY(this.y(d));
    return `translate(${x}, ${y})`;
  }

  /**
   * When the user pans or zooms, apply the transforms to the objects.
   */
  private pointLocationsChanged(transition = false) {
    const dots = transition ? this.dotsSVG.transition() : this.dotsSVG;
    dots.attr('transform', (d) => {
      return this.applyCurrTransform(d);
    });

    this.labelsSVG.attr('transform', (d) => {
      return this.applyCurrTransform(d);
    });
  };

  /**
   * Make the literal diagram of points.
   * @param layer layer of embeddings to use.
   */
  private makeDiagramUMAP() {
    this.setDefaultState();
    const svg = d3.select('#diagram')
                    .append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height)
                    .style('pointer-events', 'all')
                    .call(d3.zoom().scaleExtent([1 / 32, 4]).on('zoom', () => {
                      const zoomChanged =
                          this.transform.k != d3.event.transform.k;
                      this.transform = d3.event.transform;
                      if (zoomChanged) {
                        this.showDescriptionLabels();
                      }
                      this.pointLocationsChanged();
                    }));
    this.addDots(svg);
    this.refresh();
  }

  /**
   * Add the dots and their labels to the svg image.
   */
  private addDots(parentSVG:
                      d3.Selection<SVGSVGElement, {}, HTMLElement, any>) {
    const ttSel = d3.select('#diagram')
                      .append('div')
                      .attr('class', 'tooltip tooltip-hidden');
    ttSel.on('click', () => {});
    this.dotsSVG =
        parentSVG.selectAll('circle').data(this.data).enter().append('circle');
    this.dotsSVG.attr('class', 'dot')
        .attr('fill', (d: any) => this.color(d))
        .call(jp.attachTooltip)
        .on('mouseover',
            (d: any) => {
              d.isSelected = true;
              var spanStr = `<b style='background:${this.color(d)}'>`
              var htmlStr =
                  d.sentenceLabel
                      .replace(
                          d.currLabelWord, spanStr + d.currLabelWord + '</b>')
                      .replace(this.word, spanStr + this.word + '</b>')
              ttSel.html(htmlStr);
              this.highlightDotsWWord(d.currLabelWord)
            })
        .on('mouseout',
            (d: any) => {
              d.isSelected = false;
              this.highlightDotsWWord(null)
            })
        .attr('transform', (d) => `translate(${this.x(d)}, ${this.y(d)})`);
  }


  /**
   * Update the opacities of the dots and labels, based on whether or not they
   * are selected. Also updates the colors.
   */
  private refresh() {
    this.updatePOSLegend();
    this.dotsSVG.attr('fill', (d: any) => this.color(d))
        .attr('opacity', this.showPOS ? .5 : .8)
        .attr('r', (d: any) => d.isSelected ? 6 : 4)
        .attr(
            'stroke-width', (d: any) => d.isSelected ? 2 : d.highlight ? 1 : .5)
        .attr('stroke', (d: any) => d.highlight ? '#000' : '#777');

    if (this.labelsSVG) {
      this.labelsSVG.attr('fill', (d) => this.descColor(d.word));
    }
  };

  /**
   * Get the color of a given datapoint.
   * @param d Datapoint to get color for.
   */
  private color(d: any) {
    if (this.showPOS) {
      return this.posColor(d.pos);
    } else {
      return d.color ? d.color : 'rgb(230, 230, 230)';
    };
  }

  /**
   * Maps part of speech label to color.
   */
  private posColor(pos: string) {
    const posIdx = this.posKeys.indexOf(pos);
    const percentageOffset = .9;
    return d3.interpolateViridis(
        (posIdx / this.posKeys.length) * percentageOffset);
  }

  /**
   * Maps description label to color.
   */
  private descColor(word: string, isLabel = true) {
    const wordObj = this.labels.find(obj => obj.word == word);
    const wordIdx = this.labels.indexOf(wordObj);
    const color =
        isLabel ? d3.schemeDark2[wordIdx % 8] : d3.schemeSet2[wordIdx % 8];
    return isLabel ? (this.showPOS ? 'black' : color) : color;
  }

  /**
   * Get the X position of a given point.
   * @param d Datapoint to get location for
   * @param isLabel Whether this is a label.
   */
  private x(d: any) {
    return d.coords[this.currLayer][0];
  }

  /**
   * Get the Y position of a given point.
   * @param d Datapoint to get location for.
   * @param isLabel Whether this is a label.
   */
  private y(d: any) {
    return d.coords[this.currLayer][1];
  }

  /**
   * Update the UI to reflect the current layer.
   * @param layer Selected layer.
   */
  private updateLayer(layer: number) {
    this.currLayer = layer;
    this.resetDotColors();
    this.resetTransform();
    this.determineDescriptionLabels();
    this.showDescriptionLabels();
    this.refresh();
    this.pointLocationsChanged(true);
  }

  private resetTransform() {
    this.transform = d3.zoomIdentity;
  }

  private setLoadingState() {
    // Delete the current data
    this.data = null;

    // Reset the current layer and zoom transform.
    this.currLayer = 11;
    (this.layerDropdown.node() as HTMLInputElement).value =
        this.currLayer.toString();
    this.resetTransform();

    // Clear the parent element.
    const parentElt = d3.select('#diagram');
    parentElt.selectAll('*').remove();

    // Disable the button
    d3.select('#toggles').classed('hidden', true);

    // Update the legend.
    this.updatePOSLegend();

    // Add the loading div.
    parentElt.append('div')
        .attr('id', 'loading')
        .classed(
            'mdl-progress mdl-js-progress mdl-progress__indeterminate', true);
    componentHandler.upgradeDom()
  }

  private setDefaultState() {
    // Clear the loading div.
    d3.select('#diagram').selectAll('*').remove();
    d3.select('#toggles').classed('hidden', false);
  }
}

new BertVis().start();
