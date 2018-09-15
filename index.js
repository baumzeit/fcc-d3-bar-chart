var req = new XMLHttpRequest()
var url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
req.open('GET', url, true)
req.send()
req.onload = handleLoad

function handleLoad() {
  var json = JSON.parse(req.responseText)
  var dataset = json.data

  // chart size
  var padding = 60

  var w = 942 // manual 1:1 pixel mapping to avoid moiré effect
  var h = 500

  var yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataset, function(d) {
        return d[1]
      })
    ])
    .range([h - padding, padding])

  function createDateUTC(datestring) {
    return new Date(datestring + 'Z')
    // appending 'Z' stores date as UTC to avoid possible irregularities caused by DST (local time)
  }
  var minDate = createDateUTC(dataset[0][0])
  var maxDate = createDateUTC(dataset[dataset.length - 1][0])

  var xScale = d3
    .scaleTime()
    .domain([minDate, maxDate])
    .range([padding, w - padding])

  // bar sizing
  var barMaxWidth = (w - 2 * padding) / dataset.length
  var barGap = 1

  var svg = d3
    .select('.container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)

  svg
    .append('text') // adds chart title
    .text('United States GDP')
    .attr('x', w / 2)
    .attr('y', 60)
    .attr('text-anchor', 'middle')
    .attr('id', 'title')

  svg
    .append('text') // adds data source link
    .attr('x', w / 2)
    .attr('y', 88)
    .attr('text-anchor', 'middle')
    .html(
      'More Information: <a href="http://www.bea.gov/national/pdf/nipaguid.pdf" target="_blank" rel="noopener noreferrer">http://www.bea.gov/national/pdf/nipaguid.pdf</a>'
    )
    .attr('id', 'source')

  var tooltip = d3
    .select('body')
    .append('div') // creates tooltip element
    .attr('id', 'tooltip')
    .style('opacity', 0)

  svg
    .selectAll('rect') // create bars
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return xScale(createDateUTC(d[0]))
    })
    .attr('y', function(d) {
      return yScale(d[1])
    })
    .attr('width', barMaxWidth - barGap)
    .attr('height', function(d) {
      return h - yScale(d[1]) - padding
    })
    .attr('data-date', function(d) {
      return d[0]
    })
    .attr('data-gdp', function(d) {
      return d[1]
    })
    .attr('class', 'bar')
    .on('mouseover', function(d) {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0.9)
      tooltip
        .html(formatDate(d[0]) + '<br>' + formatGDP(d[1]))
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY - 40 + 'px')
      tooltip
        .attr('data-date', d[0]) // data attributes added
        .attr('data-gdp', d[1]) // (mostly for fCC testsuite)
    })
    // event listeners
    .on('mouseout', function(d) {
      tooltip
        .transition()
        .duration(300)
        .style('opacity', 0)
    })
    .on('click', function(d) {
      svg
        .append('text')
        .attr('x', h / 2)
        .attr('y', w / 2)
        .text(d[0] + ', ' + d[1])
    })

  function formatDate(dateString) {
    var date = dateString.split('-').map(function(d) {
      return Number(d)
    })
    var quarter = ''
    switch (date[1]) {
      case 1:
        quarter = 'Q1'
        break
      case 4:
        quarter = 'Q2'
        break
      case 7:
        quarter = 'Q3'
        break
      case 10:
        quarter = 'Q4'
        break
    }

    return 'Year: <span class="highlight">' + date[0] + '</span> | ' + quarter
  }

  function formatGDP(gdp) {
    return 'GDP: <span class="highlight">' + gdp + '</span> B$'
  }

  var xAxis = d3.axisBottom(xScale)
  var yAxis = d3.axisLeft(yScale)

  svg
    .append('g')
    .attr('transform', 'translate(0, ' + (h - padding) + ')')
    .attr('id', 'x-axis')
    .call(xAxis)

  svg
    .append('text') // text label for the x axis
    .attr('x', w / 2)
    .attr('y', h - padding / 2 + 18)
    .style('text-anchor', 'middle')
    .text('Year (quarterly)')
    .attr('class', 'axis-label')

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', 0)')
    .attr('id', 'y-axis')
    .call(yAxis)

  svg
    .append('text') // text label for the y axis
    .attr('x', padding + 40)
    .attr('y', h / 2)
    .style('text-anchor', 'middle')
    .text('Gross Domestic Product in billion $')
    .attr('writing-mode', 'vertical-rl')
    .attr('class', 'axis-label')

  svg
    .selectAll('rect')
    .data(dataset)
    .enter()
    .append('text')
    .attr('x', function(d, i) {
      return xScale(createDateUTC(d[0]))
    })
    .attr('y', function(d) {
      return yScale(d[1])
    })
}
