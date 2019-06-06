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



d3.loadData('data-selected.json', (err, res) => {
  globalRes = res[0]

  globalRes.forEach((d, i) => (d.sentenceIndex = i))
  sentences = res[0]

  sentences.forEach(sentence => {
    sentence.nodes = sentence.sentence_tokens.map((word, id) => {
      var posManning = sentence.pca_projection[id]
      var posCanonical = sentence.canonical_pca_projection[id]
      var posRand = sentence.random_unit_pca_projection[id]
      return { id, word, posManning, posCanonical, posRand }
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

  allVals = _.flatten(sentences.map(d => d.links)).map(d => d.val)

  medianDist = d3.median(allVals)

  d3.select('#pca-dash')
    .html('')
    // .appendMany('div.sentence', _.sortBy(sentences, d => d.nodes.length))
    .appendMany('div.sentence', sentences)
    .st({
      display: 'inline-block',
      width: 1620,
      border: '1px solid #eee',
      marginRight: 5
    })
    .append('h3')
    .text(d => '' + d3.format('03')(d.sentenceIndex))
    // .text(d => d.text)
    .parent()
    .append('h5')
    .text(d => `'${d.text}'`)
    .parent()
    .each(function(d) {
      drawParseTree(d3.select(this).append('div'), d)
    })
    .each(function(d) {
      drawPCADash(d3.select(this).append('div'), d, 'posManning')
    })
    .each(function(d) {
      drawPCADash(d3.select(this).append('div'), d, 'posCanonical')
    })
    .each(function(d) {
      drawPCADash(d3.select(this).append('div'), d, 'posRand')
    })

  keyPCADash()
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

function drawParseTree(sel, data) {
  const width = 320
  const height = 400

  const treeData = constructTree(data)
  const { predictedDepth } = getDepth(treeData)

  const rowHeight = height / (predictedDepth + 1)

  c = d3.conventions({
    sel: sel,
    totalWidth: 400,
    totalHeight: 400,
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
  })

  c.svg.appendMany('path', links).at({
    d: d => diagonal(d),
    stroke: '#ccc',
    strokeWidth: 2,
    fill: 'none'
  })

  c.svg
    .appendMany('g', nodes)
    .translate(d => [d.x, d.y])
    .append('g')
    .at({
      class: 'node'
    })
    .parent()
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

function drawPCADash(sel, sentence, posType) {
  c = d3.conventions({
    sel: sel,
    totalWidth: 400,
    totalHeight: 400,
    margin: {}
  })

  sentence.nodes.forEach(d => {
    d.pos = d[posType]
  })

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
      stroke: d => d.color,
      strokeWidth: 4
    })
    .call(d3.attachTooltip)

  c.svg
    .appendMany('path', sentence.links.filter(d => d.approx == 1 && d.isUpper))
    .at({
      d: d => 'M' + d.sn.pcaPos + 'L' + d.tn.pcaPos,
      stroke: d => d.color,
      strokeWidth: 4,
      strokeDasharray: '5 5',
      opacity: isCanon ? 0 : 1
    })
    .call(d3.attachTooltip)

  c.svg
    .appendMany('g', sentence.nodes)
    .translate(d => d.pcaPos)
    .call(d3.attachTooltip)
    .append('circle')
    .at({
      r: 2,
      fill: '#fff',
      stroke: '#ccc'
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
