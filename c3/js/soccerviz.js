function createSoccerViz() {

// load the data
  d3.csv("data/worldcup.csv", data => {overallTeamViz(data)})

// display the teams
  function overallTeamViz(incomingData) {
    d3.select("svg")
      .append("g")
      .attr("id", "teamsG")
      .attr("transform", "translate(50,300)")   // position teamsG group at (50,300)
      .selectAll("g")
      .data(incomingData)
      .enter()
      .append("g")
      .attr("class", "overallG")
      .attr("transform", (d, i) =>"translate(" + (i * 50) + ", 0)") //position each team

    var teamG = d3.selectAll("g.overallG");   // give each team...

    teamG
      .append("circle")                       // a circle, and
      .attr("r", 0)                             // transition chain to animate initial load
      .transition()                             // for each data point, start with radius 0
      .delay((d,i) => i * 100)                  // wait 0.1 mils (1/10th second)
      .duration(500)                            // then go up to radius 40 over 1/2 second
      .attr("r", 40)
      .transition()                           // then go down to radius 20 over 1/2 second
      .duration(500)
      .attr("r", 20)

    teamG
      .append("text")                         // a label
      .attr("y", 30)
      .text(d => d.team)

// dynamically build data-filter buttons for each type of datapoint
    const dataKeys = Object.keys(incomingData[0]) // return names of incomingData in an array
                           .filter(d =>d !== "team" && d !== "region")  // omit team & region

    d3.select("#controls").selectAll("button.teams")  // dynamically build
      .data(dataKeys).enter()                         // a button for each
      .append("button")                               // data key
      .on("click", buttonClick)                       // (except team/region)
      .html(d => d);                                  // pretty cool!

    function buttonClick(datapoint) {
      var maxValue = d3.max(incomingData, d => parseFloat(d[datapoint]))
      var radiusScale = d3.scaleLinear()
                          .domain([ 0, maxValue ]).range([ 2, 20 ])
      d3.selectAll("g.overallG").select("circle")
        .transition().duration(1000)
        .attr("r", d => radiusScale(d[datapoint]))    //todo: set to 0 when neg value
    }

// add event handling to show classifications of data
    teamG.on("mouseover", highlightRegion);           // on mouseover
                                                      // select all circles
    function highlightRegion(d) {                     // activate those with same
      d3.selectAll("g.overallG").select("circle")     // region as hovered circle
        .attr("class", p => p.region === d.region ? "active" : "inactive")
    }

    teamG.on("mouseout", function() {                 // reset when mouseout
      d3.selectAll("g.overallG")
        .select("circle").classed("inactive", false).classed("active", false)
    })
  }
}
