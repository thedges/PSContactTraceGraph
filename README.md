# PSContactTraceGraph

THIS SOFTWARE IS COVERED BY [THIS DISCLAIMER](https://raw.githubusercontent.com/thedges/Disclaimer/master/disclaimer.txt).

Demo component used in COVID-19 demo to show hierarchy relationship graph for contact tracing. This component was built specifically for a demo and is currently not configurable but would provide a good baseline for any new component that may need to be built for other demos. The component creates a "org chart" type graph that shows the relationships between current case and any related cases (via Parent case field). The assumption is that a Case record is created for each COVID-19 trace/evaluation/incident and the case Contact field points to a person under evaluation.

Here is the demo component in action:

![alt text](https://github.com/thedges/PSContactTraceGraph/blob/master/PSContactTraceGraph.gif "PSContactTraceGraph")

Here are the main configuration options:

| Parameter  | Definition |
| ------------- | ------------- |
| Height | The height in pixels for the component |

# Library Dependency

This component utilizes the following:
  * [D3.js](https://d3js.org/) - javascript library for the graph generation. This is powerful library but does have significant learning curve if something is built from scratch.
  * [Sample D3 Org Chart Code](https://blockbuilder.org/bumbeishvili/09a03b81ae788d2d14f750afe59eb7de) - sample org chart code that was 'borrowed' as foundation for this component

# Setup Instructions
Here are steps to setup and configure this component:
  * Install the component per the "Deploy to Salesforce" button below. 
  * Assign the __PSContactTraceGraph__ permission set to any user that will use this component.
  * That is it...but remember this component was built for specific demo and will only work in that demo org in it's current form.

# Installation Instructions

Click below button to install this package:

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

