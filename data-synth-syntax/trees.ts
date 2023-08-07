
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

// tslint:disable:g3-no-void-expression

import * as d3 from 'd3';
import { html, svg } from 'lit';
import { customElement } from 'lit/decorators';
import { classMap } from 'lit/directives/class-map';
import { repeat } from 'lit/directives/repeat';
import { styleMap } from 'lit/directives/style-map';
import { computed, observable } from 'mobx';
import { MobxLitElement } from '@adobe/lit-mobx';

import { COLOR_DEP, COLOR_POS, POS } from './trees_utils';

interface ParseData {
  token: string;
  pos: string;
  dep: string;
  headTokenIdx: number;
  headToken: ParseData;
  offset: number;
  idx: number;
}

interface TextData {
  parseData: { [key: string]: ParseData };
  clusterIds: { [key: string]: { [key: number]: number } };
  orderIndex: number;
  isSeed: boolean;
}

interface FrequentSequence {
  tokens: string[];
  count: number;
}

interface ClusterInfo {
  // Similarity type
  [key: string]: {
    // K clusters
    [key: number]: {
      // Cluster index
      [key: number]: Cluster
    }
  }
}
interface Cluster {
  top_sequence: FrequentSequence | {};
  colorScheme: any,
  width: number;
}

const CHAR_HEIGHT = 12;
const CHAR_WIDTH = 7;
const CHAR_COLLAPSED_HEIGHT = 3;
const NUM_CHARS_COLLAPSED = 3;
const SVG_PAD = 2;
const PAD = 2;
const Y = 50;
const Y_COLLAPSED = 2;
const Y_TOP = Y - CHAR_HEIGHT + PAD;
const Y_TOP_COLLAPSED = Y_COLLAPSED - CHAR_COLLAPSED_HEIGHT;
const MAX_VIS_WIDTH = 5000;
const NUM_TO_SET_WIDTH = 10;

/**
 * Component for spreadsheet duplicates.
 */
@customElement('trees-component')
export class TreesComponent extends MobxLitElement {

  // dataByCluster is recursive (tokens have a pointer to their dependency
  // "head" token) so we can't make it observable. (Instead, use dataLoaded.)
  data: TextData[] = [];
  // dataByCluster: TextData[][] = [];
  private dragging = false;

  @observable clusterInfo: ClusterInfo = {};
  @observable numClusterList: number[] = [];

  @observable dataLoaded = false;

  @observable colorPos = true;
  @observable colorDep = false;
  @observable colorToken = false;
  @observable enableCollapsed = false;

  @observable nClusterIndex = 4;
  @observable similarity = 'pos';
  @observable datasetName = 'music_new';


  @computed
  get nClusters(): number {
    return this.numClusterList.length > 0 ?
      this.numClusterList[this.nClusterIndex] :
      10;
  }

  @observable highlightedDep: string | null = null;
  @observable highlightedPos: string | null = null;
  @observable highlightedTextIndex: number | null = null;
  @observable highlightedToken: string | null = null;

  constructor() {
    super();
    this.loadAndPrepData();
  }

  createRenderRoot() {
    return this;
  }

  override render() {
    const topbar = html`
        <div id="header">
          ${this.renderDataDropdown()}
          ${this.renderSimTypeDropdown()}
          ${this.renderCheckboxes()}
          <div class="control">
            <button @click="${() => this.decrementNumberOfClusters()}"
              ?disabled=${this.nClusters <= this.numClusterList[0]}>-</button>
            <span><strong>${this.nClusters}</strong> clusters</span>
            <button @click="${() => this.incrementNumberOfClusters()}"
              ?disabled=${this.nClusters >=
      this.numClusterList[this.numClusterList.length - 1]}>+</button>
          </div>
          ${this.renderLegend()}
        </div>
        `;

    if (!this.dataLoaded) {
      return html`
          ${topbar}
          ${this.loading()}
        `;
    }
    return html`
        ${topbar}
        <div class="clusters">
          ${this.renderClusters()}
        </div>`;
  }

  private loading() {
    return html`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
  }

  private async loadAndPrepData() {
    // Load the data
    const rawResponse =
      await d3.json(`data/${this.datasetName}.json`) as any;

    const rawData = rawResponse.data as any[];
    this.clusterInfo = rawResponse.clusters as ClusterInfo;
    this.numClusterList =
      Object.keys(this.clusterInfo[this.similarity]).map(k => Number(k));
    rawData.forEach(d => {
      d.clusterIds = d.cluster_ids;
      d.parseData = d.parse_data;
      d.orderIndex = d.order_index[this.similarity];
      d.isSeed =
        d['all tags'].includes('User') || d['all tags'].includes('Uploaded');
    });
    this.data = rawData as TextData[];
    this.data.sort((a, b) => a.orderIndex > b.orderIndex ? 1 : -1)
    // Calculate offsets and HEAD tokens.
    this.data.forEach((textData: TextData) => {
      let offset = SVG_PAD;
      let i = 0;
      Object.values(textData.parseData).forEach((d: ParseData) => {
        d.offset = offset;
        d.idx = i++;
        offset += d.token.length + 1;
        d.headToken = textData.parseData[d.headTokenIdx];
      });
    });
    // Set width info
    for (const [similarity, dataForSimilarity] of Object.entries(this.clusterInfo)) {
      for (const [numClusters, dataForNumClusters] of Object.entries(dataForSimilarity)) {
        const clusters = this.getClusters(this.similarity, this.nClusters);
        for (const [clusterIdx, dataForCluster] of Object.entries(dataForNumClusters)) {
          dataForCluster.width = 0;
        }
      }
    }

    this.getTokenHighlights();
    this.dataLoaded = true;
  }

  private getClusters(similarity: string, nClusters: number) {
    // Organize by cluster.
    const clusterIdToIndex: { [key: number]: number } = {};

    this.data.forEach((textData: TextData) => {
      if (!clusterIdToIndex.hasOwnProperty(
        textData.clusterIds[similarity][nClusters])) {
        clusterIdToIndex[textData.clusterIds[similarity][nClusters]] =
          Object.keys(clusterIdToIndex).length;
      }
    });

    const clusters: TextData[][] = [...Array(nClusters)].map(() => []);
    this.data.forEach(
      d => clusters[clusterIdToIndex[d.clusterIds[similarity][nClusters]]]
        .push(d));

    return clusters;
  }

  private renderClusters() {
    const clusters = this.getClusters(this.similarity, this.nClusters);
    return html`
        ${clusters.map((cluster: TextData[]) => this.renderCluster(cluster))}`;
  }

  private renderSequence(sequence: FrequentSequence) {
    const tokens = sequence.tokens.map((token: string) => {
      const tokenWithPos = token.startsWith('t:') ? token.split('#') : [];
      const tokenText =
        token.startsWith('t:') ? tokenWithPos[0].slice(2) : token.slice(4);
      const tokenPos =
        token.startsWith('t:') ? tokenWithPos[1].slice(4) : token.slice(4);

      const style = styleMap({ 'background-color': COLOR_POS(tokenPos) });

      return html`
        <div class="sequenceToken" style=${style}>
          ${tokenText}
        </div>`;
    });
    const sequenceCount = `(${sequence.count} times)`;

    return html`
        <div class="sequenceTokens">
          ${tokens}
        </div>
        ${sequenceCount}`;
  }

  private renderCluster(cluster: TextData[]) {

    const clusterInfo = this.clusterInfo[this.similarity][this.nClusters];
    const clusterIdx = cluster[0].clusterIds[this.similarity][this.nClusters];
    const topSequence = clusterInfo[clusterIdx].top_sequence;

    const style = styleMap({
      'align-items': this.enableCollapsed ? '' : 'center'
    });
    const headerStyle = styleMap({'width': `${this.visWidthAll(cluster)}px`});

    return html`
      <div class='holder' style=${style}>
        <div class="clusterHeader" style=${headerStyle}>
          <div class="clusterCount">
            ${cluster.length} data point${cluster.length > 1 ? 's' : ''}
          </div>
          <div class="frequentSequence">
          ${topSequence.hasOwnProperty('tokens') ?
        this.renderSequence(topSequence as FrequentSequence) :
        ''}
          </div>
        </div>
        ${repeat(cluster, (sentence: TextData, i) => this.renderText(sentence))}
      </div>`;
  }


  /** Render the tokens of a text. */
  private renderText(d: TextData) {
    const collapseText = !(!this.enableCollapsed ||
      (this.highlightedTextIndex !== null &&
        this.highlightedTextIndex === d.orderIndex)) ?
      true :
      false;

    const svgStyle = styleMap({
      'width': `${this.visWidth(d)}px`,
      'height': `${collapseText ? Y_COLLAPSED + CHAR_COLLAPSED_HEIGHT :
        Y + CHAR_HEIGHT}px`
    });

    const classList = classMap({
      'is-seed': d.isSeed,
      'text-holder': true,
      'text-holder-no-text': collapseText,
    });

    const clusterId = d.clusterIds[this.similarity][this.nClusters];
    const cluster =
      this.clusterInfo[this.similarity][this.nClusters][clusterId];
    return html`
        <div class=${classList}>
          <svg style=${svgStyle}>
          ${repeat(
      Object.values(d.parseData),
      (data: ParseData) =>
        this.renderToken(data, d.orderIndex, collapseText, cluster))}
          </svg>
        </div>`;
  }

  /** Render token including POS color and DEP arcs. */
  private renderToken(
    d: ParseData, textIndex: number, collapseText: boolean,
    cluster: Cluster) {
    let colorDep = this.colorDep ? COLOR_DEP(d.dep) : '#ddd';
    let posColor = this.colorPos ? COLOR_POS(d.pos) : 'none';
    let tokenColor = this.colorToken ? cluster.colorScheme(d.token) : 'none';

    if (this.highlightedDep !== null || this.highlightedPos !== null) {
      if (this.highlightedDep !== d.dep || this.highlightedPos !== d.pos) {
        posColor = 'none';
        colorDep = 'none';
      }
      if (this.colorToken && this.highlightedToken !== d.token) {
        tokenColor = 'none';
      }
    }

    const mouseEnter = () => {
      if (this.enableCollapsed) return;
      this.highlightedDep = d.dep;
      this.highlightedPos = d.pos;
      this.highlightedTextIndex = textIndex;
      this.highlightedToken = d.token;
    };
    const mouseLeave = () => {
      if (this.enableCollapsed) return;
      this.highlightedDep = null;
      this.highlightedPos = null;
      this.highlightedTextIndex = null;
      this.highlightedToken = null;
    };

    const renderEdges = collapseText ? svg`` : svg`
        <path
            d=${this.path(d)}
            fill=none
            stroke=${colorDep}
            stroke-width=2px
            @mouseenter=${mouseEnter}
            @mouseleave=${mouseLeave}
          >
          </path>
          <circle
            cx=${this.center(d)}
            cy=${Y_TOP}
            r=${d.dep === 'ROOT' ? 0 : 4}
            fill=${colorDep}
          >
          </circle>`;

    const highlightColor = tokenColor !== 'none' ? tokenColor : posColor;
    return svg`
        <g>
          ${renderEdges}
          <rect
            width=${this.width(d) + PAD * 2}
            height=${collapseText ? CHAR_COLLAPSED_HEIGHT + PAD * 2 : CHAR_HEIGHT + PAD * 2}
            x=${this.x(d) - PAD}
            y=${collapseText ? Y_TOP_COLLAPSED : Y_TOP}
            fill=${highlightColor}
            @mouseenter=${mouseEnter}
            @mouseleave=${mouseLeave}
          >
          </rect>
          <text class='text'
            x=${this.x(d)}
            y=${collapseText ? Y_COLLAPSED : Y}
            @mouseenter=${mouseEnter}
            @mouseleave=${mouseLeave}
          >
          ${!collapseText ? d.token : ''}
          </text>
        </g>`;
  }

  private renderCheckboxes() {
    const colorPosCheckbox = this.renderCheckbox(
      () => this.colorPos = !this.colorPos, 'Color POS', this.colorPos);
    const colorDepCheckbox = this.renderCheckbox(
      () => this.colorDep = !this.colorDep, 'Color DEP', this.colorDep);
    const enableCollapsedCheckbox = this.renderCheckbox(
      () => this.enableCollapsed = !this.enableCollapsed, 'Collapse',
      this.enableCollapsed);
    return html`
        ${colorPosCheckbox}
        ${colorDepCheckbox}
        ${enableCollapsedCheckbox}`;
  }

  private renderLegend() {
    if (!this.colorPos) return;
    return html`<div class="legend">${Array.from(Object.keys(POS))
      .map(
        (key: string) =>
          html`<div class="legend-group"><span class="legend-text">${key}</span><div class="legend-square" style=${styleMap({
            'background-color': COLOR_POS(key)
          })}></div></div>`)}</div>`;
  }

  private renderCheckbox(
    callback: () => any, label: string, initiallyChecked: boolean) {
    return html`
        <div class="control">
        <input type=checkbox .checked=${initiallyChecked} @change=${() => callback()}>
        <label>${label}</label>
        </div>`;
  }

  private renderSimTypeDropdown() {
    const callback = () => {
      const sim =
        (document.getElementById('similarities') as any).value;

      this.colorDep = false;
      this.colorPos = false;
      this.colorToken = false;
      if (sim === 'dep') this.colorDep = true;
      if (sim === 'pos' || sim === 'embedding') this.colorPos = true;
      if (sim === 'token') this.colorToken = true;

      this.similarity = sim;

      this.dataLoaded = false;
      this.loadAndPrepData();
    };

    const selected = (name: string) => this.similarity === name;

    return html`
      <div class="control">
      <label for="similarities">Similarity</label>
      <select name="similarities" id="similarities" @change=${() => callback()}>
        <option value="pos" ?selected=${selected('pos')}>POS</option>
        <option value="dep" ?selected=${selected('dep')}>DEP</option>
        <option value="token" ?selected=${selected('token')}>Token</option>
        <option value="embedding" ?selected=${selected('embedding')}>Embedding</option>
      </select>
      </div>`;
  }


  private renderDataDropdown() {
    const callback = () => {
      this.datasetName = (document.getElementById('data') as any).value;
      this.dataLoaded = false;
      this.loadAndPrepData();
    };
    const selected = (name: string) => this.datasetName === name;
    return html`
      <div class="control">
      <label for="data">Data</label>
      <select name="data" id="data" @change=${() => callback()}>
        <option value="music_new" ?selected=${selected('music_new')}>
          music (queries)
        </option>
        <option value="music_suggestions" ?selected=${selected('music_suggestions')}>
          music (suggestions)
        </option>
        <option value="dialog" ?selected=${selected('dialog')}>
          dialog
        </option>
      </select>
      </div>`;
  }

  private incrementNumberOfClusters() {
    if (this.nClusterIndex >= this.numClusterList.length - 1) return;
    this.nClusterIndex++;
  }

  private decrementNumberOfClusters() {
    if (this.nClusterIndex <= 0) return;
    this.nClusterIndex--;
  }

  // Get all tokens across all datapoints.
  private getAllTokensInDataset() {
    const allTokens = new Set<string>();
    this.data.forEach((textData: TextData) => {
      for (const parseData of Object.values(textData.parseData)) {
        allTokens.add(parseData.token);
      }
    });
    return [...allTokens];
  }

  private getTokenHighlights() {
    const allTokens = this.getAllTokensInDataset();
    const allTokensColorScheme = this.getTokenColorscheme(allTokens);

    for (const similarity of Object.keys(this.clusterInfo)) {
      for (const nClustersString of Object.keys(this.clusterInfo[similarity])) {
        const nClusters = parseInt(nClustersString, 10);
        const clusters = this.getClusters(similarity, nClusters);

        for (const cluster of clusters) {
          const tokens = getTokensForCluster(cluster);
          const idx = cluster[0].clusterIds[similarity][nClusters];
          const colorScheme = (token: string) => {
            if (tokens.includes(token)) {
              return allTokensColorScheme(token);
            }
            return 'white';
          };
          this.clusterInfo[similarity][nClusters][idx].colorScheme =
            colorScheme;
        }
      }
    }
  }

  private getTokenColorscheme(tokens: string[]) {
    const colorScale = d3.scaleOrdinal(d3.schemeSet3);
    colorScale.domain(tokens).unknown('white');
    return colorScale;
  }

  /** X position of a token, in px. */
  private x(d: ParseData) {
    if (this.enableCollapsed) {
      return CHAR_WIDTH * (NUM_CHARS_COLLAPSED + 1) * d.idx;
    }
    return d.offset * CHAR_WIDTH;
  }

  /** Width of a token, in px. */
  private width(d: ParseData) {
    const numTokens = this.enableCollapsed ? NUM_CHARS_COLLAPSED : d.token.length;
    return CHAR_WIDTH * numTokens;
  }

  /** Center of a token, in px. */
  private center(d: ParseData) {
    return this.x(d) + this.width(d) / 2;
  }

  /** Approximate the width a single text parse tree. */
  private visWidth(d: TextData) {
    const widths = Object.values(d.parseData)
      .map(d => this.x(d) + this.width(d) + SVG_PAD * CHAR_WIDTH);
    return Math.min(Math.max(...widths), MAX_VIS_WIDTH);
  }

  /** Approximate the width for the cluster of text parse trees. */
  private visWidthAll(textDatas: TextData[]) {
    const widths = textDatas.slice(0, NUM_TO_SET_WIDTH)
      .flatMap((d: TextData) => this.visWidth(d));
    return Math.max(...widths);
  }
  /** Make a curved path from the token to the HEAD token. */
  private path(d: ParseData) {
    const xStart = this.center(d);
    const xEnd = this.center(d.headToken);
    const xMiddle = (xStart + xEnd) / 2;

    const yMiddleUntrunc = Y_TOP - Math.max(Math.abs(xEnd - xStart), 0);
    const yMiddle = Math.max(yMiddleUntrunc, 0);

    return `M${xStart},${Y_TOP} Q${xMiddle},${yMiddle} ${xEnd},${Y_TOP}`;
  }
}



function getTokensForCluster(cluster: TextData[]) {
  const allTokens: { [token: string]: number } = {};
  for (const d of cluster) {
    for (const parseData of Object.values(d.parseData)) {
      if (!(parseData.token in allTokens)) {
        allTokens[parseData.token] = 0;
      }
      allTokens[parseData.token] += 1;
    }
  }
  const tokens = Object.keys(allTokens).filter(token => allTokens[token] > 3);
  return tokens;
}
