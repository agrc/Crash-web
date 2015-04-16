define([
    'chartist',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/keys',
    'dojo/on',
    'dojo/text!app/templates/ResultsPanel.html',

    'xstyle/css!app/resources/ResultsPanel.css',
    'xstyle/css!chartist/dist/chartist.min.css'
], function(
    Chartist,

    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    lang,
    keys,
    on,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The panel to show graphs charts results from the query

        templateString: template,
        baseClass: 'results-panel',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.ResultsPanel::postCreate', arguments);

            this.setupConnections();

            this.charts = [
                this.buildChart(this.report1Node, 'Pie'),
                this.buildChart(this.report2Node, 'Pie'),
                this.buildChart(this.report3Node, 'Bar'),
                this.buildChart(this.report4Node, 'Pie'),
                this.buildChart(this.report5Node, 'Line'),
                this.buildChart(this.report6Node, 'Line')
            ];

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.ResultsPanel::setupConnections', arguments);

            this.own(on(document, 'keyup', lang.hitch(this, 'hide')));
        },
        hide: function(evt) {
            // summary:
            //      description
            // params
            console.log('app.ResultsPanel::hide', arguments);
            var charOrCode = evt.charCode || evt.keyCode;

            if(charOrCode !== keys.ESCAPE){
                return;
            }

            this.destroyRecursive();
        },
        buildChart: function(node, type) {
            // summary:
            //      builds a chart around a node
            // node
            console.log('app.ResulstPanel::buildChart', arguments);

            // Create the chart within it's 'holding' node
            var series = [[5, 2, 4, 2, 1]];
            if(type === 'Pie'){
                series = series[0];
            }

            new Chartist[type](node, {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              series: series
            });
        },
        startup: function() {
            // summary:
            //      startup for rendering
            //
            console.log('app.ResultsPanel::startup', arguments);

        }
    });
});