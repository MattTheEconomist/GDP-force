import { stateData } from "../data/stateData.js";

import { xPositionCall, yPositionCall } from "../controlPanelGroupings.js";

import { textFunctionCall } from "../controlPanelText.js";

import {
  graphDimensions,
  radiusCalc,
} from "../graphDimensions/graphDimensionsForce.js";

import {
  colorsCleanlinessBest,
  colorsCleanlinessWorst,
} from "../colorScales.js";

const width = graphDimensions.width,
  height = graphDimensions.height,
  focalXdistance = graphDimensions.focalXdistance,
  focalYdistance = graphDimensions.focalYdistance;

let groupingSelected = "groupDefault";

//Initialize a simple force layout, using the nodes and edges in dataset

let simulation = d3
  .forceSimulation(stateData)
  // .forceSimulation(testData)
  .force("charge", d3.forceManyBody().strength(1.8))
  .force(
    "x",
    d3.forceX().x((d) => {
      return xPositionCall[groupingSelected](d);
      // return 100;
    })
  )
  .force(
    "y",
    d3.forceY().y((d) => {
      return yPositionCall[groupingSelected](d);
      // return 100;
    })
  )
  .force(
    "collision",
    d3.forceCollide().radius(function (d) {
      return radiusCalc(d.totalGenerated);
    })
  );

const colors = d3.scaleOrdinal(d3.schemeCategory10);

//Create SVG element
const forceSvg = d3
  .select("#forceVizContainer")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "forceViz");

const forceTooltip = d3
  .select("body")
  .append("div")
  .attr("id", "forceTooltip")
  .style("position", "absolute")
  .style("opacity", 0);

//Create nodes as circles
const nodes = forceSvg
  .selectAll("circle")
  .attr("id", "forceSVG")
  .data(stateData)
  // .data(testData)
  .enter()
  .append("circle")
  .attr("class", "forceCircle")
  .attr("r", (d) => {
    return radiusCalc(d.totalGenerated);
  })
  .style("fill", function (d, i) {
    const cleanliness = d.electric_cleanliness;
    let saturation;

    if (cleanliness > 43) {
      saturation = colorsCleanlinessWorst(cleanliness);
      return `hsla(0, ${saturation}%, 50%, 1)`;
    }
    if (cleanliness < 43) {
      saturation = colorsCleanlinessBest(cleanliness);
      return `hsla(110, ${saturation}%, 50%, 1)`;
    }
  })
  .on("mouseover", (d) => {
    forceTooltip
      .style("opacity", 0.9)
      .style("left", d3.event.pageX + 5 + "px")
      .style("top", d3.event.pageY - 50 + "px")
      .html(forceTooltipText(d));
  })
  .on("mouseout", () => {
    forceTooltip.style("opacity", 0);
  })
  .on("dblclick", function (d) {
    console.log(d.State);

    const activeState = d.State;

    d3.select(this)
      .attr("class", "forceCircle active")
      .transition()
      .duration(1500)
      .attr("r", 500);

    // simulation.alpha(0.7).restart();

    simulation.force("charge", d3.forceManyBody().strength(0.3));

    // for (let i = 0; i < 1500; i += 50) {
    //   setTimeout(() => {
    //     simulation.force(
    //       "collision",
    //       d3.forceCollide().radius(function (d) {
    //         if (d.State === activeState) {
    //           return i / 9;
    //         } else {
    //           return radiusCalc(d.totalGenerated);
    //         }
    //       })
    //     );

    //     console.log("hi");
    //   }, 50);
    // }
  });

// d3.selectAll(".forceCircle").filter(function () {
//   return !this.classList.contains("active");
// });
// .transition()
// .duration(1000)
// .attr("opacity", 0);
// .style("fill", "blue");
// });

//Every time the simulation "ticks", this will be called
simulation.on("tick", ticked);

function ticked() {
  nodes
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    });
}

const groupingButtons = document.getElementsByClassName("groupingBtn");

Array.from(groupingButtons).forEach((el) => {
  el.addEventListener("click", changeGrouping);
});

function changeGrouping(el) {
  groupingSelected = el.currentTarget.id;

  textFunctionCall[groupingSelected]();

  // console.log("grouping changed", groupingSelected);
  simulation.alpha(0.7).restart();
  simulation.force("x").initialize(stateData);
  simulation.force("y").initialize(stateData);
}

function forceTooltipText(d) {
  forceTooltip.style("background-color", "white");

  const stateName = d.name;
  const totalElectricity = Math.round(d.totalGenerated);
  const electric_cleanliness = d.electric_cleanliness.toFixed(2);

  return `<span id="forceTooltipState"> ${stateName}</span>

  <table>
  <tr>
  <td>Electricity Generated: </td>
  <td>${totalElectricity}</td>
  </tr>
  <tr>
  <td>Electric Cleanliness: </td>
  <td>${electric_cleanliness}</td>
  </tr>
  </table>`;
}
