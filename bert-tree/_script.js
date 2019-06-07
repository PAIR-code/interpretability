console.clear()
d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var colors = ['#d7301f', '#d7301f', '#fc8d59', '#fdcc8a', '#fef0d9']

function colorDiverging(d, m) {
  return d3.interpolateRdYlBu((d - m) / 6 + 0.5)
}

function colorSequential(d, m) {
  return d3.interpolateViridis(d / 5)
}

var logScale = d3.scaleLog().domain([1 / 4, 4])

function colorLog(d) {
  return d3.interpolateRdYlBu(logScale(d))
}

var isMobile = innerWidth < 1100
var bodyLeftMargin = isMobile ? 10 : 80

//sentences.forEach(sentence => sentence.sentence_tokens.forEach(d => obj[['pcaManning', sentence.sentenceIndex, d].join(' ')] = 'olol'))
var posOverride = {
  'posManning 0 July': [0, 12],
  'posManning 0 In': [-20, 12],
  'posManning 0 ,': [0, -2],
  'posManning 0 imposed': [0, 15],
  'posManning 0 a': [0, 12],
  'posManning 0 on': [0, 16],
  'posManning 0 all': [-5, 8],
  'posManning 0 a': [0, 12],
  'posManning 0 ban': [3, 2],
  'posManning 0 uses': [-5, 3],
  'posManning 0 of': [12, 0],
  'posManning 0 Protection': [3, 6],
  'posManning 0 the': [-12, -2],
  'posManning 0 gradual': [3, 0],
  'posManning 0 of': [17, 0],


  "posManning 1 succeeds": [0, 0],
  "posManning 1 Terrence": [-36, 15],
  "posManning 1 D.": [-14, 12],
  'posManning 1 Daniels': [-53, 6],
  "posManning 1 ,": [1,4],
  "posManning 1 formerly": [3, 3],
  "posManning 1 a": [0, 12],
  "posManning 1 W.R.": [0, 0],
  "posManning 1 Grace": [0, 0],
  "posManning 1 vice": [0, 0],
  "posManning 1 chairman": [0, 0],
  "posManning 1 who": [0, 0],
  "posManning 1 resigned": [0, 0],
  "posManning 1 .": [0, 0],

  "posManning 2 Pierre": [20, -4],
  "posManning 2 Vinken": [0, 0],
  "posManning 2 ,": [0, 5],
  "posManning 2 61": [0, 0],
  "posManning 2 years": [0, 0],
  "posManning 2 old": [0, 15],
  "posManning 2 will": [0, 0],
  "posManning 2 join": [0, 15],
  "posManning 2 the": [0, 0],
  "posManning 2 board": [0, 14],
  "posManning 2 as": [0, 0],
  "posManning 2 a": [0, 14],
  "posManning 2 nonexecutive": [0, 14],
  "posManning 2 director": [0, 15],
  "posManning 2 Nov.": [0, 0],
  "posManning 2 29": [0, 0],
  "posManning 2 .": [0, 0],

  "posManning 3 Rudolph": [2, 15],
  "posManning 3 Agnew": [0, 0],
  "posManning 3 ,": [0, 0],
  "posManning 3 55": [-14, 0],
  "posManning 3 years": [0, 14],
  "posManning 3 old": [0, 15],
  "posManning 3 and": [-5, 0],
  "posManning 3 former": [-23, 16],
  "posManning 3 chairman": [4, 8],
  "posManning 3 of": [0, 0],
  "posManning 3 Consolidated": [0, 0],
  "posManning 3 Gold": [0, 14],
  "posManning 3 Fields": [3, 14],
  "posManning 3 PLC": [-20, 0],
  "posManning 3 was": [0, 0],
  "posManning 3 named": [0, 0],
  "posManning 3 a": [0, 0],
  "posManning 3 nonexecutive": [0, 0],
  "posManning 3 director": [60, 15],
  "posManning 3 this": [20, 20],
  "posManning 3 British": [-1, 16],
  "posManning 3 industrial": [0, 0],
  "posManning 3 conglomerate": [0, 0],
  "posManning 3 .": [0, 0],

  "posManning 4 The": [0, 0],
  "posManning 4 field": [0, 0],
  "posManning 4 has": [-25, 0],
  "posManning 4 reserves": [0, 16],
  "posManning 4 of": [0, 16],
  "posManning 4 21": [0, 0],
  "posManning 4 million": [0, 0],
  "posManning 4 barrels": [0, 16],
  "posManning 4 .": [0, 0],

  "posCanonical 4 reserves": [0, 16],
  "posRand 4 reserves": [0, 16],
  "posCanonical 4 has": [6, 6],
  "posRand 4 has": [6, 6],


  "posManning 5 The": [0, 0],
  "posManning 5 sale": [0, 0],
  "posManning 5 of": [0, 0],
  "posManning 5 Southern": [0, 0],
  "posManning 5 Optical": [0, 0],
  "posManning 5 is": [0, 0],
  "posManning 5 a": [0, 0],
  "posManning 5 part": [0, 0],
  "posManning 5 the": [0, 0],
  "posManning 5 program": [0, 0],
  "posManning 5 .": [0, 0],

  "posManning 6 Factories": [0, 0],
  "posManning 6 booked": [0, 0],
  "posManning 6 $": [0, 0],
  "posManning 6 236.74": [0, 0],
  "posManning 6 billion": [0, 0],
  "posManning 6 in": [0, 0],
  "posManning 6 orders": [0, 0],
  "posManning 6 September": [0, 0],
  "posManning 6 ,": [0, 0],
  "posManning 6 nearly": [0, 0],
  "posManning 6 the": [0, 0],
  "posManning 6 same": [0, 0],
  "posManning 6 as": [0, 0],
  "posManning 6 236.79": [0, 0],
  "posManning 6 August": [0, 0],
  "posManning 6 Commerce": [0, 0],
  "posManning 6 Department": [0, 0],
  "posManning 6 said": [0, 0],
  "posManning 6 .": [0, 0],

  "posManning 7 A": [0, 0],
  "posManning 7 spokesman": [0, 0],
  "posManning 7 for": [0, 0],
  "posManning 7 the": [0, 0],
  "posManning 7 guild": [0, 0],
  "posManning 7 said": [0, 0],
  "posManning 7 union": [0, 0],
  "posManning 7 's": [0, 0],
  "posManning 7 lawyers": [0, 0],
  "posManning 7 are": [0, 0],
  "posManning 7 reviewing": [0, 0],
  "posManning 7 suit": [0, 0],
  "posManning 7 .": [0, 0],

  "posManning 8 This": [0, 0],
  "posManning 8 trial": [0, 0],
  "posManning 8 is": [0, 0],
  "posManning 8 expected": [0, 0],
  "posManning 8 to": [0, 0],
  "posManning 8 last": [0, 0],
  "posManning 8 five": [0, 0],
  "posManning 8 weeks": [0, 0],
  "posManning 8 .": [0, 0],

  "posManning 9 In": [0, 0],
  "posManning 9 July": [0, 0],
  "posManning 9 ,": [0, 0],
  "posManning 9 the": [0, 0],
  "posManning 9 Environmental": [0, 0],
  "posManning 9 Protection": [0, 0],
  "posManning 9 Agency": [0, 0],
  "posManning 9 imposed": [0, 0],
  "posManning 9 a": [0, 0],
  "posManning 9 gradual": [0, 0],
  "posManning 9 ban": [0, 0],
  "posManning 9 on": [0, 0],
  "posManning 9 virtually": [0, 0],
  "posManning 9 all": [0, 0],
  "posManning 9 uses": [0, 0],
  "posManning 9 of": [0, 0],
  "posManning 9 asbestos": [0, 0],
  "posManning 9 .": [0, 0],

  "posManning 10 He": [0, 0],
  "posManning 10 succeeds": [0, 0],
  "posManning 10 Terrence": [0, 0],
  "posManning 10 D.": [0, 0],
  "posManning 10 Daniels": [0, 0],
  "posManning 10 ,": [0, 0],
  "posManning 10 formerly": [0, 0],
  "posManning 10 a": [0, 0],
  "posManning 10 W.R.": [0, 0],
  "posManning 10 Grace": [0, 0],
  "posManning 10 vice": [0, 0],
  "posManning 10 chairman": [0, 0],
  "posManning 10 who": [0, 0],
  "posManning 10 resigned": [0, 0],
  "posManning 10 .": [0, 0],

  "posManning 11 Pierre": [0, 0],
  "posManning 11 Vinken": [0, 0],
  "posManning 11 ,": [0, 0],
  "posManning 11 61": [0, 0],
  "posManning 11 years": [0, 0],
  "posManning 11 old": [0, 0],
  "posManning 11 will": [0, 0],
  "posManning 11 join": [0, 0],
  "posManning 11 the": [0, 0],
  "posManning 11 board": [0, 0],
  "posManning 11 as": [0, 0],
  "posManning 11 a": [0, 0],
  "posManning 11 nonexecutive": [0, 0],
  "posManning 11 director": [0, 0],
  "posManning 11 Nov.": [0, 0],
  "posManning 11 29": [0, 0],
  "posManning 11 .": [0, 0],

  "posManning 12 Rudolph": [0, 0],
  "posManning 12 Agnew": [0, 0],
  "posManning 12 ,": [0, 0],
  "posManning 12 55": [0, 0],
  "posManning 12 years": [0, 0],
  "posManning 12 old": [0, 0],
  "posManning 12 and": [0, 0],
  "posManning 12 former": [0, 0],
  "posManning 12 chairman": [0, 0],
  "posManning 12 of": [0, 0],
  "posManning 12 Consolidated": [0, 0],
  "posManning 12 Gold": [0, 0],
  "posManning 12 Fields": [0, 0],
  "posManning 12 PLC": [0, 0],
  "posManning 12 was": [0, 0],
  "posManning 12 named": [0, 0],
  "posManning 12 a": [0, 0],
  "posManning 12 nonexecutive": [0, 0],
  "posManning 12 director": [0, 0],
  "posManning 12 this": [0, 0],
  "posManning 12 British": [0, 0],
  "posManning 12 industrial": [0, 0],
  "posManning 12 conglomerate": [0, 0],
  "posManning 12 .": [0, 0],

  "posManning 13 A": [0, 0],
  "posManning 13 spokesman": [0, 0],
  "posManning 13 for": [0, 0],
  "posManning 13 the": [0, 0],
  "posManning 13 IRS": [0, 0],
  "posManning 13 confirmed": [0, 0],
  "posManning 13 that": [0, 0],
  "posManning 13 ``": [0, 0],
  "posManning 13 there": [0, 0],
  "posManning 13 has": [0, 0],
  "posManning 13 been": [0, 0],
  "posManning 13 correspondence": [0, 0],
  "posManning 13 mailed": [0, 0],
  "posManning 13 about": [0, 0],
  "posManning 13 incomplete": [0, 0],
  "posManning 13 8300s": [0, 0],
  "posManning 13 ,": [0, 0],
  "posManning 13 ''": [0, 0],
  "posManning 13 but": [0, 0],
  "posManning 13 he": [0, 0],
  "posManning 13 declined": [0, 0],
  "posManning 13 to": [0, 0],
  "posManning 13 say": [0, 0],
  "posManning 13 why": [0, 0],
  "posManning 13 letters": [0, 0],
  "posManning 13 were": [0, 0],
  "posManning 13 sent": [0, 0],
  "posManning 13 lawyers": [0, 0],
  "posManning 13 now": [0, 0],
  "posManning 13 .": [0, 0],

  "posManning 14 Mr.": [0, 0],
  "posManning 14 Samnick": [0, 0],
  "posManning 14 ,": [0, 0],
  "posManning 14 who": [0, 0],
  "posManning 14 will": [0, 0],
  "posManning 14 go": [0, 0],
  "posManning 14 before": [0, 0],
  "posManning 14 the": [0, 0],
  "posManning 14 disciplinary": [0, 0],
  "posManning 14 panel": [0, 0],
  "posManning 14 said": [0, 0],
  "posManning 14 proceedings": [0, 0],
  "posManning 14 are": [0, 0],
  "posManning 14 unfair": [0, 0],
  "posManning 14 and": [0, 0],
  "posManning 14 that": [0, 0],
  "posManning 14 any": [0, 0],
  "posManning 14 punishment": [0, 0],
  "posManning 14 from": [0, 0],
  "posManning 14 guild": [0, 0],
  "posManning 14 would": [0, 0],
  "posManning 14 be": [0, 0],
  "posManning 14 unjustified": [0, 0],
  "posManning 14 .": [0, 0],
}



d3.loadData('data-selected.json', 'extra-random-pca.json', (err, res) => {
  globalRes = res
  extraEmbeds = res[1]

  globalRes.forEach((d, i) => (d.sentenceIndex = i))
  sentences = res[0]

  sentences.forEach(sentence => {
    sentence.nodes = sentence.sentence_tokens.map((word, id) => {
      var posManning = sentence.pca_projection[id]
      var posCanonical = sentence.canonical_pca_projection[id]
      var posRand = sentence.random_unit_pca_projection[id]
      var uuid = id + word

      return { id, word, posManning, posCanonical, posRand, uuid }
    })

    sentence.links = []

    sentence.distance_predictions.forEach((word, i) => {
      word.forEach((val, j) => {
        var actual = sentence.distance_actual[i][j]
        sentence.links.push({ source: i, target: j, val, actual })
      })
    })

    sentence.links.forEach(d => {
      d.approx = Math.round(d.val)
      d.dif = d.approx - d.actual
      if (d.approx == 0) d.approx = 1
      d.show = d.approx == 1 || d.actual == 1

      d.sn = sentence.nodes[d.source]
      d.tn = sentence.nodes[d.target]

      d.isUpper = d.source < d.target
    })
  })


  // d3.select('#pca-dash')
  //   .html('')
  //   .appendMany('div.sentence', sentences)
  //   .st({
  //     display: 'inline-block',
  //     width: 1620,
  //     border: '1px solid #eee',
  //     marginRight: 5
  //   })
  //   .append('h3')
  //   .text(d => '' + d3.format('03')(d.sentenceIndex))
  //   // .text(d => d.text)
  //   .parent()
  //   .append('h5')
  //   .text(d => `'${d.text}'`)
  //   .parent()
  //   .each(function(d) {
  //     drawParseTree(d3.select(this).append('div'), d)
  //   })
  //   .each(function(d) {
  //     drawPCADash(d3.select(this).append('div'), d, 'posManning')
  //   })
  //   .each(function(d) {
  //     drawPCADash(d3.select(this).append('div'), d, 'posCanonical')
  //   })
  //   .each(function(d) {
  //     drawPCADash(d3.select(this).append('div'), d, 'posRand')
  //   })

  // keyPCADash()



  var totalWidth = innerWidth - bodyLeftMargin*2

  // header code
  var numHeader = d3.clamp(1, Math.floor(totalWidth/300), 4)
  var headerWidth = Math.min(totalWidth/numHeader, 350)

  d3.select('#header')
    .html('')
    .st({height: headerWidth})
    .appendMany('div.sentence', sentences.slice(0, numHeader))
    .st({
      position: 'absolute',
      left: (d, i) => i*(headerWidth + 10),
      width: headerWidth,
    })
    .each(function(d) {
      drawPCADash(d3.select(this).append('div'), d, 'posManning', headerWidth)
    })


  var abcdSentence = sentences[4]

  abcdSentence.nodes.forEach(d => {
    // d.posManning[1] = 1 - d.posManning[1]
    d.posCanonical[0] = 1 - d.posCanonical[0]
    d.posRand[0] = 1 - d.posRand[0]
  })


  // TODO: use PCA of random embedding
  abcdSentence.nodes.forEach(d => d.fullRand = [Math.random(), Math.random()])

  abcdWidth = Math.min(isMobile ? 700 : 1100, totalWidth)/(isMobile ? 2 : 4)

  var blocks = [
    {type: 'posManning', text: 'a) BERT embedding'},
    {type: 'posCanonical', text: 'b) Exact Pythagorean embedding'},
    {type: 'posRand', text: 'c) Randomly branching embeddings'},
    {type: 'fullRand', text: 'd) Independent random positions'},
  ]

  var abcdSel = d3.select('#real-ideal')
    .html('')
    .st({width: isMobile ? '' : 1200, marginLeft: isMobile ? 0 : -20})
    .appendMany('div.sentence', blocks)
    .append('div').text(d => d.text)
    .st({fontSize: 12, lineHeight: 15, maxWidth: isMobile ? 160 : 1000, fontWeight: 800, marginLeft: isMobile ? 0 : 20})
    .parent()
    .st({
      display: 'inline-block',
      width: abcdWidth,
    })
    .each(function(d) {
      drawPCADash(d3.select(this).append('div'), abcdSentence, d.type, abcdWidth, true)
    })

  var lastIndex = 3

  if (window.__randInterval) window.__randInterval.stop()
  window.__randInterval = d3.interval(() => {
    abcdSentence.nodes.forEach(d => {
      d.pcaPos = [Math.random()*abcdWidth, Math.random()*abcdWidth]
    })

    abcdSel
      .filter(d => d.type == 'fullRand')
      .selectAll('path')
      .transition().duration(500)
      .at({ d: d => 'M' + d.sn.pcaPos + 'L' + d.tn.pcaPos })

    abcdSel
      .filter(d => d.type == 'fullRand')
      .selectAll('g.node')
      .transition().duration(500)
      .translate(d => d.pcaPos)


    lastIndex++
    lastIndex = lastIndex % 100
    var embed = extraEmbeds.pcaUnit[lastIndex]

    if (embed[0][0] > embed[5][0]){
      embed.forEach(d => {
        d[0] = 1 - d[0]
      })
    }

    if (embed[0][1] < embed[3][1]){
      embed.forEach(d => {
        d[1] = 1 - d[1]
      })
    }

    abcdSentence.nodes.forEach((d, i) => {
      d.pos = embed[i]
    })

    var c = abcdSentence.c
    c.x.domain(d3.extent(abcdSentence.nodes, d => d.pos[0]))
    c.y.domain(d3.extent(abcdSentence.nodes, d => d.pos[1]))

    abcdSentence.nodes.forEach(d => {
      d.pcaPos = [c.x(d.pos[0]), c.y(d.pos[1])]
    })


    abcdSel
      .filter(d => d.type == 'posRand')
      .selectAll('path')
      .transition().duration(500)
      .at({ d: d => 'M' + d.sn.pcaPos + 'L' + d.tn.pcaPos })

    abcdSel
      .filter(d => d.type == 'posRand')
      .selectAll('g.node')
      .transition().duration(500)
      .translate(d => d.pcaPos)



  }, 2500)



  var treeSel = d3.select('#parse-tree')
    .html('')
    .st({display: 'none'})

  sentences[5].nodes.forEach(d => {
    d.posManning[1] = 1 - d.posManning[1]
    d.posManning[0] = 1 - d.posManning[0]
  })
  drawDuelTree(treeSel.append('div.sentence'), sentences[5], 280)
  drawDuelTree(treeSel.append('div.sentence'), sentences[6], 350)

  function drawDuelTree(sel, sentence, width){
    sel.classed('duel-tree', true)
    sel.append('div.title').text('“' + sentence.text.replace(' .', '.') + '”')

    drawParseTree(sel.append('div'), sentence, width)
    drawPCADash(sel.append('div'), sentence, 'posManning', width)
  }

  






})

function keyPCADash() {
  var sel = d3
    .select('#pca-dash-key')
    .html('')
    .append('svg')
    .at({ width: 300, height: 80 })

  var ticks = 300

  var x = d3
    .scaleLog()
    .domain([1 / 4, 4])
    .range([0, 300])

  bandSel = sel.append('g').translate([20, 60])
  bandSel.appendMany('rect', d3.range(0, 300)).at({
    x: (d, i) => i,
    fill: d => colorLog(x.invert(d)),
    height: 20,
    width: 1
  })

  bandSel
    .appendMany('text', [1 / 4, 1 / 2, 1, 2, 4])
    .at({
      x: x,
      fill: d => colorLog(d),
      y: 40,
      textAnchor: 'middle'
    })
    .st({
      textShadow: d =>
        d == 1 ? '0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000' : 0
    })
    .text(d => d)

  var lineHeight = 30
  colors.slice(0, 2).forEach((color, i) => {
    var text = 'Ground Truth Dependency'
    if (!i) {
      text = 'No Ground Truth Dependency, Manning Distance < 1.5'
    }
    if (i == 4) {
      text = text.replace('~4', '>3')
    }

    sel
      .append('g')
      .translate([20, lineHeight * i])
      .append('path')
      .at({
        d: d => 'M' + [0, 0] + 'L' + [40, 0],
        stroke: colors[2],
        strokeWidth: 4,
        strokeDasharray: i ? '' : '5 5'
      })
      .parent()
      .append('text')
      .text(text)
      .translate([45, 5])
  })
}

function drawParseTree(sel, data, width=320) {
  const height = width

  const treeData = constructTree(data)
  const { predictedDepth } = getDepth(treeData)

  const rowHeight = height / (predictedDepth + 1)

  c = d3.conventions({
    sel: sel,
    totalWidth: width,
    totalHeight: height,
    margin: {}
  })

  var treeLayout = d3.tree()
  treeLayout.size([width, height])

  const root = d3.hierarchy(treeData)

  treeLayout(root)

  c.svg
    .select(this.treeContainer)
    .append('svg')
    .attr('width', 400)
    .attr('height', 400)
    .append('g')

  // Compute the new tree layout.
  const nodes = root.descendants()
  const links = root.links()

  nodes.forEach(d => {
    d.x += 0
    d.y = d.data.cumulativeDistance * rowHeight

    d.uuid = d.data.uuid
  })

  c.svg.appendMany('path', links).at({
    d: d => diagonal(d),
    stroke: '#ccc',
    strokeWidth: 2,
    fill: 'none'
  })

  c.svg
    .appendMany('g.node', nodes)
    .call(d3.attachTooltip)
    .translate(d => [d.x, d.y])
    // .append('g')
    // .at({
    //   class: 'node'
    // })
    // .parent()
    .append('circle')
    .at({
      r: 2,
      fill: '#fff',
      stroke: '#ccc'
    })
    .parent()
    .append('text')
    .text(d => d.data.token)
    .at({
      dy: 0,
      fontSize: 11,
      dx: d => (d.x > 200 ? -4 : 4),
      textAnchor: d => (d.x > 300 ? 'end' : '')
    })
}

function drawPCADash(sel, sentence, posType, size=400, isGrey=false) {
  c = d3.conventions({
    sel: sel,
    totalWidth: size,
    totalHeight: size,
    margin: {}
  })

  sentence.nodes.forEach(d => {
    d.pos = d[posType]
  })

  sentence.c = c

  c.x.domain(d3.extent(sentence.nodes, d => d.pos[0]))
  c.y.domain(d3.extent(sentence.nodes, d => d.pos[1]))

  sentence.nodes.forEach(d => {
    d.pcaPos = [c.x(d.pos[0]), c.y(d.pos[1])]
  })

  var isCanon = posType == 'posCanonical' || posType === 'posRand'
  sentence.links.forEach(d => {
    d.color = colorLog(d.val / d.actual)
    if (isCanon) d.color = colorLog(1)
  })

  c.svg
    .appendMany('path', sentence.links.filter(d => d.actual == 1))
    .at({
      d: d => 'M' + d.sn.pcaPos + 'L' + d.tn.pcaPos,
      stroke: d => isGrey ? '#ddd' : d.color,
      strokeWidth: 4
    })
    .call(d3.attachTooltip)

  c.svg
    .appendMany('path', sentence.links.filter(d => d.approx == 1 && d.isUpper))
    .at({
      d: d => 'M' + d.sn.pcaPos + 'L' + d.tn.pcaPos,
      stroke: d => isGrey ? 'rgba(0,0,0,0)' : d.color,
      strokeWidth: 4,
      strokeDasharray: '5 5',
      opacity: isCanon ? 0 : 1
    })
    .call(d3.attachTooltip)

  c.svg
    .appendMany('g.node', sentence.nodes)
    .on('mouseover', d => {
      sel.parent().parent().selectAll('g.node')
        .classed('active', e => e.uuid == d.uuid)

      sel.parent().parent().selectAll('path')
        .classed('active', e => e.sn.uuid == d.uuid || e.tn.uuid == d.uuid)
    })
    .translate(d => d.pcaPos)
    .call(d3.attachTooltip)
    .append('circle')
    .at({
      r: 3,
      fill: '#fff',
      stroke: '#ccc',
      strokeWidth: 2,
    })
    .parent()
    .append('text')
    .text(d => d.word)
    .at({
      dy: -4,
      fontSize: 11,
      dx: d => (d.pcaPos[0] > 200 ? -2 : 2),
      textAnchor: d => (d.pcaPos[0] > 200 ? 'end' : '')
    })
    .translate(d => {
      var key = [posType, sentence.sentenceIndex, d.word].join(' ')
      d.key = key
      d.override =posOverride[key]

      return posOverride[key] || [0, 0]
    })

}

function constructTree(data) {
  const rootEdge = data.edges.find(([a, b]) => a === b)
  const edges = data.edges.filter(e => e !== rootEdge)
  const rootIndex = rootEdge[0]

  const makeNode = makeNodeFn(data, rootIndex)

  const expandTree = node => {
    const outgoingEdges = edges.filter(edge => {
      return edge[1] === node.index
    })
    node.children = outgoingEdges.map(edge => {
      const index = edge[0]
      const child = makeNode(index, node)
      return expandTree(child)
    })
    return node
  }

  const root = makeNode(rootIndex)
  const tree = expandTree(root)

  return tree
}

const makeNodeFn = (data, rootIndex) => (index, parent = null) => {
  const depth = data.distance_actual[index][rootIndex]
  const distanceFromParent = parent
    ? data.distance_predictions[index][parent.index]
    : 0
  const cumulativeDistance = parent
    ? parent.cumulativeDistance + distanceFromParent
    : 0

  const node = {
    index: index,
    depth,
    distanceFromParent,
    cumulativeDistance,
    token: data.sentence_tokens[index],
    uuid: data.nodes[index].uuid,
    children: [],
    parent
  }

  return node
}

function diagonal(d) {
  // return 'M' + [d.source.x, d.source.y] + 'L' + [d.target.x, d.target.y]

  const sx = d.source.x
  const sy = d.source.y
  const tx = d.target.x
  const ty = d.target.y
  // const avgx = (sx + tx) / 2
  const avgy = (sy + ty) / 2
  return `M${sx},${sy}C${sx},${avgy} ${tx},${avgy} ${tx},${ty}`
}

function getDepth(tree) {
  let depth = 0
  let predictedDepth = 0
  traverseTree(tree, n => (depth = Math.max(depth, n.depth)))
  traverseTree(tree, n => {
    predictedDepth = Math.max(predictedDepth, n.cumulativeDistance)
  })

  return { depth, predictedDepth }
}

const traverseTree = (node, fn) => {
  fn(node)
  for (const child of node.children) {
    traverseTree(child, fn)
  }
}
