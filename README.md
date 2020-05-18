# PSContactTraceGraph

THIS SOFTWARE IS COVERED BY [THIS DISCLAIMER](https://raw.githubusercontent.com/thedges/Disclaimer/master/disclaimer.txt).

Demo component used in COVID-19 demo to show hierarchy relationship graph for contact tracing. This component was built specifically for a demo and is currently not configurable but would provide a good baseline for any new component that may need to be built for other demos. The component creates a "org chart" type graph that shows the relationships between current case and any related cases (via Parent case field). The assumption is that a Case record is created for each COVID-19 trace/evaluation/incident and the case Contact field points to a person under evaluation.

Here is the demo component in action:

![alt text](https://github.com/thedges/PSContactTraceGraph/blob/master/PSContactTraceGraph.gif "PSContactTraceGraph")

Here are the main configuration options:

| Parameter  | Definition |
| ------------- | ------------- |
| Height | The height in pixels for the component |

# Hierarchy ID

Determining all records (cases in this demo) that are part of a hierarchy using the Parent field is not simple task. Normally this would require multiple SOQL calls to determine all related cases. A simple way to determine all cases in a hierarchy is to tag each case with the Id of the root node of the hierarchy. This can be done with formula field like the following. This is field that was created on the Case object that will set the root node Id on each case in the graph. Thus all one has to do is get the Id value for the case you are on and then query for all other cases that have that same id.

```
IF( ISBLANK(Parent.Id) , Id ,
  IF( ISBLANK( Parent.Parent.Id ) , Parent.Id ,
    IF( ISBLANK( Parent.Parent.Parent.Id ) , Parent.Parent.Id,
      IF( ISBLANK( Parent.Parent.Parent.Parent.Id ) , Parent.Parent.Parent.Id, 
        IF( ISBLANK( Parent.Parent.Parent.Parent.Parent.Id ) , Parent.Parent.Parent.Parent.Id, 
          IF( ISBLANK( Parent.Parent.Parent.Parent.Parent.Parent.Id ) , Parent.Parent.Parent.Parent.Parent.Id, 
            IF( ISBLANK( Parent.Parent.Parent.Parent.Parent.Parent.Parent.Id ) , Parent.Parent.Parent.Parent.Parent.Parent.Id, 
              IF( ISBLANK( Parent.Parent.Parent.Parent.Parent.Parent.Parent.Parent.Id ) , Parent.Parent.Parent.Parent.Parent.Parent.Parent.Id, 
                Parent.Parent.Parent.Parent.Parent.Parent.Parent.Parent.Id
              )
            )
          )
        )
      )
    )
  )
)
```

# Field Dependency & Color Scheme

For each card displayed in the hierarchy, the default background color is "blue". The current record you are on is highlighed with "grey" background.

The card can include 3 icons (First Responder, Quarantined, or Do Not Call) which depends on following fields:

| Field  | Logic |
| ------------- | ------------- |
| Contact.First_Responder__c | Boolean field if contact is first responder. If checked, First Responder icon is shown in lower left of card |
| Contact.Quarantined__c | Boolean field if contact is quarantined. If checked, Quarantined icon is shown in lower left of card |
| Contact.DoNotCall | Boolean field if contact if contact should not be contacted by phone. If checked, Do Not Call icon is shown in lower left of card |

This component shows case icon in top left of each card with certain color code. The color scheme is red for 'Tested Positive', yellow for 'Needs Contacting', and green for 'Contacted'. The logic is as follows:

| Color |Status  | Logic |
| --- | ------------- | ------------- |
| Red | Tested Positive | c.Contact.HasCOVID_19__c __OR__ c.Status == 'Tested Positive' |
| Yellow | Needs Contacting | c.Status == 'Left Message' __OR__ c.Status == 'New' __OR__ c.Status == 'Could Not Contact'  |
| Green | Contacted | ...else if not any of above |


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

