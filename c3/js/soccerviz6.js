function createSoccerViz() {

// load the data
  d3.csv("data/worldcup.csv", data => {overallTeamViz(data)})

// load an svg icon
// Football by James Zamyslianskyj from the Noun Project
  d3.html("resources/futbol.svg", loadLOGO);
  function loadLOGO(svgData) {
      d3.select(svgData).selectAll("path").each(function() {
            d3.select("svg").node().appendChild(this);
      });
      d3.selectAll("path").attr("transform", "translate(30,30)");
  }

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

    // Put a resized icon on each team's circle
    // Football by James Zamyslianskyj from the Noun Project
    d3.html("resources/icon.svg", loadSVG);
    function loadSVG(svgData) {
        d3.selectAll("g").each(function() {
          var gParent = this;
          d3.select(svgData).selectAll("path").each(function() {
            gParent.appendChild(this.cloneNode(true))
          });
        });
        // rebind the circle elements to the data
        d3.selectAll("g.overallG").each(function(d) {
           d3.select(this).selectAll("path").datum(d);
        });
        // color the balls by their conference colors
        var fourColorScale = d3.scaleOrdinal()
                               .domain(["UEFA", "CONMEBOL", "CAF", "AFC"])
                               .range(["#5eafc6", "#FE9922", "#93C464", "#fcbc34" ]);
        d3.selectAll("path")
          .style("fill", p =>fourColorScale(p.region))
          .style("stroke", "black")
          .style("stroke-width", "2px");
    }




// dynamically build data-filter buttons for each type of datapoint
    const dataKeys = Object.keys(incomingData[0]) // return names of incomingData in an array
                           .filter(d =>d !== "team" && d !== "region")  // omit team & region

    d3.select("#controls").selectAll("button.teams")  // dynamically build
      .data(dataKeys).enter()                         // a button for each
      .append("button")                               // data key
      .on("click", buttonClick)                       // (except team/region)
      .html(d => d);                                  // pretty cool!

    function buttonClick(datapoint) {
      // use color brewer to show data point rating in size and color scale
      var maxValue = d3.max(incomingData, d => parseFloat(d[datapoint]));
      var colorQuantize = d3.scaleQuantize()
                            .domain([0,maxValue]).range(colorbrewer.Reds[3]);
      var radiusScale = d3.scaleLinear()
                          .domain([0,maxValue]).range([2,20]);
      d3.selectAll("g.overallG").select("circle")
        .transition().duration(1000)
        .style("fill", d =>colorQuantize(d[datapoint]))
        .attr("r", d =>radiusScale(d[datapoint]))
    }


// add event handling to show classifications of data
    teamG.on("mouseover", highlightRegion)
    function highlightRegion (d) {
      d3.select(this).select("text").classed("active", true).attr("y", 10);
      d3.selectAll("g.overallG").select("circle")
        .each(function(p) {
           p.region == d.region ?
                d3.select(this).classed("active", true) :
                d3.select(this).classed("inactive", true);
         });
      this.parentElement.appendChild(this);   // reappend circle so that z-index is at top
                                              // this ensures name sits above neighboring circles
      teamG.select("text").style("pointer-events","none");  // don't include text in the mouse trigger
    }

    teamG.on("mouseout", unHighlight)
    function unHighlight() {
      d3.selectAll("g.overallG").select("circle").attr("class", "")
      d3.selectAll("g.overallG").select("text")
        .classed("active", false).attr("y", 30)
    }

// add a stats box modal (with external template html) w/ click listener
    d3.text("resources/modal.html", html => {
        d3.select("body").append("div").attr("id", "modal").html(html)
    })
    teamG.on("click", teamClick)
    function teamClick(d) {
        d3.selectAll("td.data").data(d3.values(d))
            .html(p =>p)
    }

  }
}
