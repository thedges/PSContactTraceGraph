import {LightningElement, api} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {loadScript} from 'lightning/platformResourceLoader';
import {NavigationMixin} from 'lightning/navigation';
import APP_RESOURCES from '@salesforce/resourceUrl/PSContactTraceGraph';
import getData from '@salesforce/apex/PSContactTraceGraphController.getData';

// Site for base D3 code: https://blockbuilder.org/bumbeishvili/09a03b81ae788d2d14f750afe59eb7de

export default class PSContactTraceGraph
  extends NavigationMixin (LightningElement) {
  @api recordId;
  @api height = 800;
  refreshIcon = APP_RESOURCES + '/graph-refresh.png';
  firstResponderIcon = APP_RESOURCES + '/first-responder.png';
  doNotCallIcon = APP_RESOURCES + '/do-not-call.png';
  quarantinedIcon = APP_RESOURCES + '/quarantined.png';
  caseRedIcon = APP_RESOURCES + '/case-red.png';
  caseGreenIcon = APP_RESOURCES + '/case-green.png';
  caseYelloIcon = APP_RESOURCES + '/case-yellow.png';
  caseOrangeIcon = APP_RESOURCES + '/case-orange.png';
  caseIcon = APP_RESOURCES + '/case.png';

  d3Initialized = false;
  data;
  nodes = [];

  get containerStyle() {
    return 'padding-top:5px; width:100%; height:' + this.height + 'px';
  }

  connectedCallback () {
    if (this.d3Initialized) {
      return;
    }
    this.d3Initialized = true;



    Promise.all ([loadScript (this, APP_RESOURCES + '/d3.v5.min.js')])
      .then (() => {
        this.initializeChart ();
      })
      .catch (error => {
        console.log ('error=' + JSON.stringify (error));
        this.dispatchEvent (
          new ShowToastEvent ({
            title: 'Error loading D3',
            message: error.message,
            variant: 'error',
          })
        );
      });
  }

  addZero(val)
  {
    if (val < 10)
    {
      val = '0' + val;
    }
    return val;
  }

  initializeChart () {
    var self = this;

    ////////////////////////////////////////////////////////////////////////////////
    // get configuration from PSAccountContactHierarchy__mdt custom metadata type //
    ////////////////////////////////////////////////////////////////////////////////
    getData ({recordId: this.recordId})
      .then (result => {
        //var self = this;
        console.log ('result1=' + result);
        //self.nodes = JSON.parse (result);

        var imageURL = self.caseIcon;

        var data = JSON.parse (result);
        self.nodes = [];

        data.forEach (function (d, index) {
            var node = {};
            node.caseId = d.caseId;
            node.contactId = d.contactId;
            node.nodeId = d.caseId;
            node.parentNodeId = d.caseParentId;
            node.width = 342;
            node.height = 146;
            node.borderWidth = 1;
            node.borderRadius = 5;
  
            //node.borderColor = self.hexToRgb ('#0f8c79', 1);
            //node.backgroundColor = self.hexToRgb ('#33b6d0', 1);
            node.borderColor = self.hexToRgb ('#1B5297', 1);
            node.backgroundColor = self.hexToRgb ('#1B5297', 1);

            if (d.caseId == self.recordId)
            {
                //node.borderWidth = 7;
                //node.borderColor = self.hexToRgb ('#FFA500', 1);
                node.backgroundColor = self.hexToRgb ('#808080', 1);
            }

          
            if (d.contactStatus == 'Positive')
            {
              imageURL = APP_RESOURCES + '/case-red.png';
            }
            else if (d.contactStatus == 'Contacted')
            {
              imageURL = APP_RESOURCES + '/case-green.png';
            }
            else
            {
              imageURL = APP_RESOURCES + '/case-yellow.png';
            }
            

            console.log('imageURL=' + imageURL);

  
            node.nodeImage = {
              url: imageURL,
              width: 70,
              height: 70,
              centerTopDistance: 20,
              centerLeftDistance: 0,
              cornerShape: 'ROUNDED',
              shadow: false,
              borderWidth: 1,
              borderColor: self.hexToRgb ('#1B5297', 1),
            };
  
            console.log ('B');
  
            node.nodeIcon = {icon: imageURL, size: 30};

            var phone;
            if (d.contactMobile != null)
            {
              phone = d.contactMobile;
            }
            else
            {
              phone = d.contactPhone;
            }
  
            var template = '<div>' +
            '<div style="margin-left:70px;margin-top:10px;font-size:20px;font-weight:bold;">' + d.contactName;
/*
            if (d.firstResponder)
            {
              template += '&nbsp;<img src="' + self.firstResponderIcon + '" alt="First Responder" height="20" width="20"></img>';
            }

            if (d.doNotCall)
            {
              template += '&nbsp;<img src="' + self.doNotCallIcon + '" alt="Do Not Call" height="20" width="20"></img>';
            }

            if (d.contactQuarantined)
            {
              template += '&nbsp;<img src="' + self.quarantinedIcon + '" alt="Quarantined" height="20" width="20"></img>';
            }
            */

            template += '</div>' +
            '<div style="margin-left:70px;margin-top:3px;font-size:16px;">' +  self.nullValue(self.formatPhoneNumber(phone)) + '</div>' +
            //'<div style="margin-left:70px;margin-top:3px;font-size:16px;"><lightning-click-to-dial value="14155555551"></lightning-click-to-dial></div>' +
            '<div style="margin-left:70px;margin-top:3px;font-size:16px;">' + self.nullValue(d.contactEmail) + '</div>' +
            '<div style="margin-left:10px;margin-top:15px;font-size:14px;position:absolute;bottom:5px;">';

            if (d.firstResponder)
            {
              template += '&nbsp;<img src="' + self.firstResponderIcon + '" alt="First Responder" height="35" width="35"></img>';
            }

            if (d.doNotCall)
            {
              template += '&nbsp;<img src="' + self.doNotCallIcon + '" alt="Do Not Call" height="35" width="35"></img>';
            }

            if (d.contactQuarantined)
            {
              template += '&nbsp;<img src="' + self.quarantinedIcon + '" alt="Quarantined" height="35" width="35"></img>';
            }

            template += '</div>' +
            '<div style="margin-left:196px;margin-top:15px;font-size:14px;position:absolute;bottom:5px;">' +
            '<div>Case #: ' + self.nullValue(d.caseNumber) + '</div>' +
            '<div style="margin-top:5px">' + self.nullValue(d.contactCity) + '</div>' +
            '</div>' +
            '</div>';

            node.template = template;
  
            node.connectorLineColor = self.hexToRgb (
              //'#dcbdcf',  
              '#a4c0f4',   // cornflower blue
              1
            );
            node.connectorLineWidth = 5;
            node.dashArray = '';
            node.expanded = false;
            node.directSubordinates = 0;
            node.totalSubordinates = 0;
  
            self.nodes.push (node);
        });

       console.log ('nodes=' + JSON.stringify (self.nodes));

        this.chart (this.template)
          .container ('.chart-container')
          .data (self.nodes)
          //.svgHeight (window.innerHeight)
          .svgHeight (self.height)
          .initialZoom (0.6)
          .onNodeClick (d => {
            console.log (d + ' node clicked');

            self[NavigationMixin.Navigate] ({
              type: 'standard__recordPage',
              attributes: {
                recordId: d,
                actionName: 'view',
              },
            });

          })
          .render ();

      })
      .catch (error => {
        this.handleError (error);
      });
  }

  nullValue(val) {
    if (val == null)
    {
      return '&nbsp;';
    }
    return val;
  }

  formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumberString;
  }

  resetGraph() {
    console.log('resetGraph invoked...');
    this.initializeChart ();
    //this.chart.updateData();
    //zoom.transform(d3.select(chartContainer).select('svg.view'), d3.zoomIdentity.scale(1));
  }

  hexToRgb (hex, alpha) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec (hex);
    return result
      ? {
          "red": parseInt (result[1], 16),
          "green": parseInt (result[2], 16),
          "blue": parseInt (result[3], 16),
          "alpha": alpha
        }
      : null;
  }

  handleError (err) {
    console.log ('error=' + err);
    console.log ('type=' + typeof err);

    this.showSpinner = false;

    const event = new ShowToastEvent ({
      title: err.statusText,
      message: err.body.message,
      variant: 'error',
      mode: 'pester',
    });
    this.dispatchEvent (event);
  }

  chart (template) {
    // Exposed variables
    var attrs = {
      id: 'ID' + Math.floor (Math.random () * 1000000), // Id for event handlings
      svgWidth: '100%',
      svgHeight: 600,
      marginTop: 0,
      marginBottom: 0,
      marginRight: 0,
      marginLeft: 0,
      container: 'body',
      defaultTextFill: '#2C3E50',
      nodeTextFill: 'white',
      defaultFont: 'Helvetica',
      backgroundColor: '#fafafa',
      data: null,
      depth: 180,
      duration: 600,
      strokeWidth: 3,
      dropShadowId: null,
      initialZoom: 1,
      onNodeClick: d => d,
    };

    var dt = new Date();
    var uid = '' + this.addZero(dt.getHours()) + this.addZero(dt.getMinutes()) + this.addZero(dt.getSeconds());
    console.log('uid=' + uid);

    //InnerFunctions which will update visuals
    var updateData;

    //Main chart object
    var main = function () {
      //Drawing containers
      console.log ('attrs=' + JSON.stringify (attrs));
      console.log ('attrs.container=' + JSON.stringify (attrs.container));
      //var container = d3.select(attrs.container);
      var container = d3.select (template.querySelector (attrs.container));



      console.log ('container=' + JSON.stringify (container));
      console.log (
        'container.nodeType=' + JSON.stringify (container.node ().nodeType)
      );
      var containerRect = container.node ().getBoundingClientRect ();
      if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

      setDropShadowId (attrs);

      //Calculated properties
      var calc = {
        id: null,
        chartTopMargin: null,
        chartLeftMargin: null,
        chartWidth: null,
        chartHeight: null,
      };
      calc.id = 'ID' + Math.floor (Math.random () * 1000000); // id for event handlings
      calc.chartLeftMargin = attrs.marginLeft;
      calc.chartTopMargin = attrs.marginTop;
      calc.chartWidth =
        attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
      calc.chartHeight =
        attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
      calc.nodeMaxWidth = d3.max (attrs.data, d => d.width);
      calc.nodeMaxHeight = d3.max (attrs.data, d => d.height);

      attrs.depth = calc.nodeMaxHeight + 100;

      calc.centerX = calc.chartWidth / 2;

      attrs.svgWidth = '100%'; // set svg width to grow/shrink to container

      //********************  LAYOUTS  ***********************
      const layouts = {
        treemap: null,
      };

      layouts.treemap = d3
        .tree ()
        .size ([calc.chartWidth, calc.chartHeight])
        .nodeSize ([calc.nodeMaxWidth + 100, calc.nodeMaxHeight + attrs.depth]);

      // ******************* BEHAVIORS . **********************
      const behaviors = {
        zoom: null,
      };

      behaviors.zoom = d3.zoom ().on ('zoom', zoomed);

      //container.call(behaviors.zoom.transform, d3.zoomIdentity);

      //behaviors.zoom.transform(d3.select(attrs.container).select('svg.view'), d3.zoomIdentity.scale(1));

      //****************** ROOT node work ************************
      const root = d3
        .stratify ()
        .id (function (d) {
          return d.nodeId;
        })
        .parentId (function (d) {
          return d.parentNodeId;
        }) (attrs.data);

      root.x0 = 0;
      root.y0 = 0;

      const allNodes = layouts.treemap (root).descendants ();

      allNodes.forEach (d => {
        Object.assign (d.data, {
          directSubordinates: d.children ? d.children.length : 0,
          totalSubordinates: d.descendants ().length - 1,
        });
      });

      //root.children.forEach (collapse);
      //root.children.forEach (expandSomeNodes);

      //Add svg
      var svg = container
        .patternify ({
          tag: 'svg',
          selector: 'svg-chart-container',
        })
        .attr ('width', attrs.svgWidth)
        .attr ('height', attrs.svgHeight)
        .attr ('font-family', attrs.defaultFont)
        .call (behaviors.zoom)
        .attr ('cursor', 'move')
        .style ('background-color', attrs.backgroundColor);

        

      //Add container g element
      var chart = svg
        .patternify ({
          tag: 'g',
          selector: 'chart',
        })
        .attr (
          'transform',
          'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')'
        );

      var centerG = chart
        .patternify ({
          tag: 'g',
          selector: 'center-group',
        })
        .attr (
          'transform',
          `translate(${calc.centerX},${calc.nodeMaxHeight / 2}) scale(${attrs.initialZoom})`
        );


    
      if (attrs.lastTransform) {
        behaviors.zoom
          .scaleBy (chart, attrs.lastTransform.k)
          .translateTo (chart, attrs.lastTransform.x, attrs.lastTransform.y);
      }
    

      // Troy - re-position on reset button trigger
      svg.transition().duration(750).call(
        behaviors.zoom.transform,
        d3.zoomIdentity
      );
    

      const defs = svg.patternify ({
        tag: 'defs',
        selector: 'image-defs',
      });

      const filterDefs = svg.patternify ({
        tag: 'defs',
        selector: 'filter-defs',
      });

      var filter = filterDefs
        .patternify ({tag: 'filter', selector: 'shadow-filter-element'})
        .attr ('id', attrs.dropShadowId)
        .attr ('y', `${-50}%`)
        .attr ('x', `${-50}%`)
        .attr ('height', `${200}%`)
        .attr ('width', `${200}%`);

      filter
        .patternify ({
          tag: 'feGaussianBlur',
          selector: 'feGaussianBlur-element',
        })
        .attr ('in', 'SourceAlpha')
        .attr ('stdDeviation', 3.1)
        .attr ('result', 'blur');

      filter
        .patternify ({tag: 'feOffset', selector: 'feOffset-element'})
        .attr ('in', 'blur')
        .attr ('result', 'offsetBlur')
        .attr ('dx', 4.28)
        .attr ('dy', 4.48)
        .attr ('x', 8)
        .attr ('y', 8);

      filter
        .patternify ({tag: 'feFlood', selector: 'feFlood-element'})
        .attr ('in', 'offsetBlur')
        .attr ('flood-color', 'black')
        .attr ('flood-opacity', 0.3)
        .attr ('result', 'offsetColor');

      filter
        .patternify ({tag: 'feComposite', selector: 'feComposite-element'})
        .attr ('in', 'offsetColor')
        .attr ('in2', 'offsetBlur')
        .attr ('operator', 'in')
        .attr ('result', 'offsetBlur');

      var feMerge = filter.patternify ({
        tag: 'feMerge',
        selector: 'feMerge-element',
      });

      feMerge
        .patternify ({tag: 'feMergeNode', selector: 'feMergeNode-blur'})
        .attr ('in', 'offsetBlur');

      feMerge
        .patternify ({tag: 'feMergeNode', selector: 'feMergeNode-graphic'})
        .attr ('in', 'SourceGraphic');

      // Display tree contenrs
      update (root);

      // Smoothly handle data updating
      updateData = function () {};

      //#########################################  UTIL FUNCS ##################################
      function setDropShadowId (d) {
        if (d.dropShadowId) return;

        let id = d.id + '-drop-shadow';
        //@ts-ignore
        if (typeof DOM != 'undefined') {
          //@ts-ignore
          id = DOM.uid (d.id).id;
        }
        Object.assign (d, {
          dropShadowId: id,
        });
      }

      function rgbaObjToColor (d) {
        return `rgba(${d.red},${d.green},${d.blue},${d.alpha})`;
      }

      // Zoom handler func
      function zoomed () {
        console.log('zoomed...');
        var transform = d3.event.transform;
        //attrs.lastTransform = transform;
        chart.attr ('transform', transform);
      }

      // Toggle children on click.
      function click (d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update (d);
      }

      function diagonal (s, t) {
        const x = s.x;
        const y = s.y;
        const ex = t.x;
        const ey = t.y;

        let xrvs = ex - x < 0 ? -1 : 1;
        let yrvs = ey - y < 0 ? -1 : 1;

        let rdef = 35;
        let r = Math.abs (ex - x) / 2 < rdef ? Math.abs (ex - x) / 2 : rdef;

        r = Math.abs (ey - y) / 2 < r ? Math.abs (ey - y) / 2 : r;

        let h = Math.abs (ey - y) / 2 - r;
        let w = Math.abs (ex - x) - r * 2;
        //w=0;
        const path = `
                    M ${x} ${y}
                    L ${x} ${y + h * yrvs}
                    C  ${x} ${y + h * yrvs + r * yrvs} ${x} ${y + h * yrvs + r * yrvs} ${x + r * xrvs} ${y + h * yrvs + r * yrvs}
                    L ${x + w * xrvs + r * xrvs} ${y + h * yrvs + r * yrvs}
                    C ${ex}  ${y + h * yrvs + r * yrvs} ${ex}  ${y + h * yrvs + r * yrvs} ${ex} ${ey - h * yrvs}
                    L ${ex} ${ey}
         `;
        return path;
      }

      function collapse (d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach (collapse);
          d.children = null;
        }
      }

      function expandSomeNodes (d) {
        if (d.data.expanded) {
          let parent = d.parent;
          while (parent) {
            if (parent._children) {
              parent.children = parent._children;

              //parent._children=null;
            }
            parent = parent.parent;
          }
        }
        if (d._children) {
          d._children.forEach (expandSomeNodes);
        }
      }

      function handleCaseClick(d, i) {
        console.log('handleCaseClick caseId=' + d.data.caseId);
        attrs.onNodeClick(d.data.caseId);
      }

      function handleContactClick(d, i) {
        console.log('handleContactClick contactId=' + d.data.contactId);
        attrs.onNodeClick(d.data.contactId);
      }

      function update (source) {
        //  Assigns the x and y position for the nodes

        const treeData = layouts.treemap (root);

        // Get tree nodes and links
        const nodes = treeData.descendants ().map (d => {
          if (d.width) return d;

          console.log('processing descendants...');
          console.log('d.data.nodeImage=' + d.data.nodeImage);

          let imageWidth = 100;
          let imageHeight = 100;
          let imageBorderColor = 'steelblue';
          let imageBorderWidth = 0;
          let imageRx = 0;
          let imageCenterTopDistance = 0;
          let imageCenterLeftDistance = 0;
          let borderColor = 'steelblue';
          let backgroundColor = 'steelblue';
          let width = d.data.width;
          let height = d.data.height;
          let dropShadowId = `none`;
          if (d.data.nodeImage && d.data.nodeImage.shadow) {
            dropShadowId = `url(#${attrs.dropShadowId})`;
          }
          if (d.data.nodeImage && d.data.nodeImage.width) {
            imageWidth = d.data.nodeImage.width;
          }
          if (d.data.nodeImage && d.data.nodeImage.height) {
            imageHeight = d.data.nodeImage.height;
          }
          if (d.data.nodeImage && d.data.nodeImage.borderColor) {
            imageBorderColor = rgbaObjToColor (d.data.nodeImage.borderColor);
          }
          if (d.data.nodeImage && d.data.nodeImage.borderWidth) {
            imageBorderWidth = d.data.nodeImage.borderWidth;
          }
          if (d.data.nodeImage && d.data.nodeImage.centerTopDistance) {
            imageCenterTopDistance = d.data.nodeImage.centerTopDistance;
          }
          if (d.data.nodeImage && d.data.nodeImage.centerLeftDistance) {
            imageCenterLeftDistance = d.data.nodeImage.centerLeftDistance;
          }
          if (d.data.borderColor) {
            borderColor = rgbaObjToColor (d.data.borderColor);
          }
          if (d.data.backgroundColor) {
            backgroundColor = rgbaObjToColor (d.data.backgroundColor);
          }
          if (
            d.data.nodeImage &&
            d.data.nodeImage.cornerShape.toLowerCase () == 'circle'
          ) {
            imageRx = Math.max (imageWidth, imageHeight);
          }
          if (
            d.data.nodeImage &&
            d.data.nodeImage.cornerShape.toLowerCase () == 'rounded'
          ) {
            imageRx = Math.min (imageWidth, imageHeight) / 6;
          }

          return Object.assign (d, {
            imageWidth,
            imageHeight,
            imageBorderColor,
            imageBorderWidth,
            borderColor,
            backgroundColor,
            imageRx,
            width,
            height,
            imageCenterTopDistance,
            imageCenterLeftDistance,
            dropShadowId,
          });
        });

        const links = treeData.descendants ().slice (1);

        // Set constant depth for each nodes
        nodes.forEach (d => (d.y = d.depth * attrs.depth));
        // ------------------- FILTERS ---------------------

        const patternsSelection = defs
          .selectAll ('.pattern')
          .data (nodes, d => d.id + '-' + uid);

        const patternEnterSelection = patternsSelection
          .enter ()
          .append ('pattern');

        const patterns = patternEnterSelection
          .merge (patternsSelection)
          .attr ('class', 'pattern')
          .attr ('height', 1)
          .attr ('width', 1)
          .attr ('id', d => d.id + '-' + uid);

        /*
              const patternImages = patterns
              .patternify ({
                tag: 'lightning-icon',
                selector: 'pattern-image',
                data: d => [d],
              })
              .attr ('icon-name', 'action:approval')
              .attr ('x', 0)
              .attr ('y', 0)
              .attr ('height', d => d.imageWidth)
              .attr ('width', d => d.imageHeight)
              .attr ('viewbox', d => `0 0 ${d.imageWidth * 2} ${d.imageHeight}`)
              .attr ('preserveAspectRatio', 'xMidYMin slice');
              */

        const patternImages = patterns
          .patternify ({
            tag: 'image',
            selector: 'pattern-image',
            data: d => [d],
          })
          .attr ('x', 0)
          .attr ('y', 0)
          .attr ('height', d => d.imageWidth)
          .attr ('width', d => d.imageHeight)
          .attr ('xlink:href', d => d.data.nodeImage.url)
          .attr ('viewbox', d => `0 0 ${d.imageWidth * 2} ${d.imageHeight}`)
          .attr ('preserveAspectRatio', 'xMidYMin slice');

        patternsSelection
          .exit ()
          .transition ()
          .duration (attrs.duration)
          .remove ();

        // --------------------------  LINKS ----------------------

        // Update the links...
        var linkSelection = centerG
          .selectAll ('path.link')
          .data (links, function (d) {
            return d.id;
          });

        // Enter any new links at the parent's previous position.
        var linkEnter = linkSelection
          .enter ()
          .insert ('path', 'g')
          .attr ('class', 'link')
          .attr ('d', function (d) {
            var o = {
              x: source.x0,
              y: source.y0,
            };
            return diagonal (o, o);
          });

        // UPDATE
        var linkUpdate = linkEnter.merge (linkSelection);

        // Styling links
        linkUpdate
          .attr ('fill', 'none')
          .attr ('stroke-width', d => d.data.connectorLineWidth || 2)
          .attr ('stroke', d => {
            if (d.data.connectorLineColor) {
              return rgbaObjToColor (d.data.connectorLineColor);
            }
            return 'green';
          })
          .attr ('stroke-dasharray', d => {
            if (d.data.dashArray) {
              return d.data.dashArray;
            }
            return '';
          });

        // Transition back to the parent element position
        linkUpdate
          .transition ()
          .duration (attrs.duration)
          .attr ('d', function (d) {
            return diagonal (d, d.parent);
          });

        // Remove any exiting links
        var linkExit = linkSelection
          .exit ()
          .transition ()
          .duration (attrs.duration)
          .attr ('d', function (d) {
            var o = {
              x: source.x,
              y: source.y,
            };
            return diagonal (o, o);
          })
          .remove ();

        // --------------------------  NODES ----------------------
        // Updating nodes
        const nodesSelection = centerG
          .selectAll ('g.node')
          .data (nodes, d => d.id);

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = nodesSelection
          .enter ()
          .append ('g')
          .attr ('class', 'node')
          .attr ('transform', function (d) {
            return 'translate(' + source.x0 + ',' + source.y0 + ')';
          })
          .attr ('cursor', 'pointer')
          .on ('click', function (d) {
            if (
              [...d3.event.srcElement.classList].includes ('node-button-circle')
            ) {
              return;
            }
            //attrs.onNodeClick (d.data.nodeId);
          });

        // Add rectangle for the nodes
        nodeEnter
          .patternify ({
            tag: 'rect',
            selector: 'node-rect',
            data: d => [d],
          })
          .attr ('width', 1e-6)
          .attr ('height', 1e-6)
          .style ('fill', function (d) {
            return d._children ? 'lightsteelblue' : '#fff';
          });

        // Add foreignObject element
        const fo = nodeEnter
          .patternify ({
            tag: 'foreignObject',
            selector: 'node-foreign-object',
            data: d => [d],
          })
          .attr ('width', d => d.width)
          .attr ('height', d => d.height)
          .attr ('x', d => -d.width / 2)
          .attr ('y', d => -d.height / 2)
          .on("click", handleContactClick);;

        // Add foreign object
        fo
          .patternify ({
            tag: 'xhtml:div',
            selector: 'node-foreign-object-div',
            data: d => [d],
          })
          .style ('width', d => d.width + 'px')
          .style ('height', d => d.height + 'px')
          .style ('color', 'white')
          .html (d => d.data.template);

        /*
            nodeEnter
              .patternify ({
                tag: 'image',
                selector: 'node-icon-image',
                data: d => [d],
              })
              .attr ('width', d => d.data.nodeIcon.size)
              .attr ('height', d => d.data.nodeIcon.size)
              .attr ('xlink:href', d => d.data.nodeIcon.icon)
              .attr ('x', d => -d.width / 2 + 5)
              .attr ('y', d => d.height / 2 - d.data.nodeIcon.size - 5);
    
              
            nodeEnter
              .patternify ({
                tag: 'text',
                selector: 'node-icon-text-total',
                data: d => [d],
              })
              .text ('test')
              .attr ('x', d => -d.width / 2 + 7)
              .attr ('y', d => d.height / 2 - d.data.nodeIcon.size - 5)
              //.attr('text-anchor','middle')
              .text (d => d.data.totalSubordinates + ' Subordinates')
              .attr ('fill', attrs.nodeTextFill)
              .attr ('font-weight', 'bold');
    
            nodeEnter
              .patternify ({
                tag: 'text',
                selector: 'node-icon-text-direct',
                data: d => [d],
              })
              .text ('test')
              .attr ('x', d => -d.width / 2 + 10 + d.data.nodeIcon.size)
              .attr ('y', d => d.height / 2 - 10)
              .text (d => d.data.directSubordinates + ' Direct ')
              .attr ('fill', attrs.nodeTextFill)
              .attr ('font-weight', 'bold');
              */

        // Node images
        const nodeImageGroups = nodeEnter.patternify ({
          tag: 'g',
          selector: 'node-image-group',
          data: d => [d],
        });

        // Node image rectangle
        nodeImageGroups.patternify ({
          tag: 'rect',
          selector: 'node-image-rect',
          data: d => [d],
        });

        // Node button circle group
        const nodeButtonGroups = nodeEnter
          .patternify ({
            tag: 'g',
            selector: 'node-button-g',
            data: d => [d],
          })
          .on ('click', click);

        // Add button circle
        nodeButtonGroups.patternify ({
          tag: 'circle',
          selector: 'node-button-circle',
          data: d => [d],
        });

        // Add button text
        nodeButtonGroups
          .patternify ({
            tag: 'text',
            selector: 'node-button-text',
            data: d => [d],
          })
          .attr ('pointer-events', 'none');

        // Node update styles
        var nodeUpdate = nodeEnter
          .merge (nodesSelection)
          .style ('font', '12px sans-serif');

        // Transition to the proper position for the node
        nodeUpdate
          .transition ()
          .attr ('opacity', 0)
          .duration (attrs.duration)
          .attr ('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          })
          .attr ('opacity', 1);

        // Move images to desired positions
        nodeUpdate.selectAll ('.node-image-group').attr ('transform', d => {
          let x = -d.imageWidth / 2 - d.width / 2;
          let y = -d.imageHeight / 2 - d.height / 2;
          return `translate(${x},${y})`;
        });

        nodeUpdate
          .select ('.node-image-rect')
          .attr ('fill', d => `url(#${d.id + '-' + uid})`)
          .attr ('width', d => d.imageWidth)
          .attr ('height', d => d.imageHeight)
          .attr ('stroke', d => d.imageBorderColor)
          .attr ('stroke-width', d => d.imageBorderWidth)
          .attr ('rx', d => d.imageRx)
          .attr ('y', d => d.imageCenterTopDistance)
          .attr ('x', d => d.imageCenterLeftDistance)
          .attr ('filter', d => d.dropShadowId)
          .on("click", handleCaseClick);

        // Update  node attributes and style
        nodeUpdate
          .select ('.node-rect')
          .attr ('width', d => d.data.width)
          .attr ('height', d => d.data.height)
          .attr ('x', d => -d.data.width / 2)
          .attr ('y', d => -d.data.height / 2)
          .attr ('rx', d => d.data.borderRadius || 0)
          .attr ('stroke-width', d => d.data.borderWidth || attrs.strokeWidth)
          .attr ('cursor', 'pointer')
          .attr ('stroke', d => d.borderColor)
          .style ('fill', d => d.backgroundColor);

        // Move node button group to the desired position
        nodeUpdate
          .select ('.node-button-g')
          .attr ('transform', d => {
            return `translate(0,${d.data.height / 2})`;
          })
          .attr ('opacity', d => {
            if (d.children || d._children) {
              return 1;
            }
            return 0;
          });

        // Restyle node button circle
        nodeUpdate
          .select ('.node-button-circle')
          .attr ('r', 16)
          .attr ('stroke-width', d => d.data.borderWidth || attrs.strokeWidth)
          .attr ('fill', attrs.backgroundColor)
          .attr ('stroke', d => d.borderColor);

        // Restyle texts
        nodeUpdate
          .select ('.node-button-text')
          .attr ('text-anchor', 'middle')
          .attr ('alignment-baseline', 'middle')
          .attr ('fill', attrs.defaultTextFill)
          .attr ('font-size', d => {
            if (d.children) return 40;
            return 26;
          })
          .text (d => {
            if (d.children) return '-';
            return '+';
          });

        // Remove any exiting nodes

        var nodeExitTransition = nodesSelection
          .exit ()
          .attr ('opacity', 1)
          .transition ()
          .duration (attrs.duration)
          .attr ('transform', function (d) {
            return 'translate(' + source.x + ',' + source.y + ')';
          })
          .on ('end', function () {
            d3.select (this).remove ();
          })
          .attr ('opacity', 0);

        // On exit reduce the node rects size to 0
        nodeExitTransition
          .selectAll ('.node-rect')
          .attr ('width', 10)
          .attr ('height', 10)
          .attr ('x', 0)
          .attr ('y', 0);

        // On exit reduce the node image rects size to 0
        nodeExitTransition
          .selectAll ('.node-image-rect')
          .attr ('width', 10)
          .attr ('height', 10)
          .attr ('x', d => d.width / 2)
          .attr ('y', d => d.height / 2);

        // Store the old positions for transition.
        nodes.forEach (function (d) {
          d.x0 = d.x;
          d.y0 = d.y;
        });
      

        // debugger;
      }

      d3.select (window).on ('resize.' + attrs.id, function () {
        var containerRect = container.node ().getBoundingClientRect ();
        //	if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
        //	main();
      });
    };

    //----------- PROTOTYPE FUNCTIONS  ----------------------
    d3.selection.prototype.patternify = function (params) {
      var container = this;
      var selector = params.selector;
      var elementTag = params.tag;
      var data = params.data || [selector];

      // Pattern in action
      var selection = container
        .selectAll ('.' + selector)
        .data (data, (d, i) => {
          if (typeof d === 'object') {
            if (d.id) {
              return d.id;
            }
          }
          return i;
        });
      selection.exit ().remove ();
      selection = selection.enter ().append (elementTag).merge (selection);
      selection.attr ('class', selector);
      return selection;
    };

    //Dynamic keys functions

    Object.keys (attrs).forEach (key => {
      // Attach variables to main function
      //@ts-ignore

      console.log ('key=' + key);
      main[key] = function (_) {
        /*
                    var string = `this.attrs['${key}'] = _`;
                    if (!arguments.length) {
                        return eval(` this.attrs['${key}'];`);
                    }
                    console.log('string=' + string);
                    eval(string);
                    */
        this.attrs[key] = _;
        return main;
      };
      return main;
    });

    //Set attrs as property
    //@ts-ignore
    main['attrs'] = attrs;

    //Exposed update functions
    //@ts-ignore
    main['data'] = function (value) {
      if (!arguments.length) return attrs.data;
      attrs.data = value;
      if (typeof updateData === 'function') {
        updateData ();
      }
      return main;
    };

    // Run  visual
    //@ts-ignore
    main['render'] = function () {
      main ();
      return main;
    };

    return main;
  }
}