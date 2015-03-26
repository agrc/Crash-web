define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/text!app/templates/ResultsPanel.html',

    'dojox/charting/Chart',
    'dojox/charting/plot2d/Pie',
    'dojox/charting/themes/PlotKit/green',
    'xstyle/css!app/resources/ResultsPanel.css'
], function(
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
    template,

    Chart,
    Pie,
    green
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      The panel to show graphs charts results from the query

        templateString: template,
        baseClass: 'results-panel',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.ResultsPanel::postCreate', arguments);

            this.setupConnections();

            this.charts = [
                this.buildChart(this.report1Node),
                this.buildChart(this.report2Node),
                this.buildChart(this.report3Node)
            ];

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.ResultsPanel::setupConnections', arguments);
        },
        showCharts: function() {
            // summary:
            //      description
            // params
            console.log('app.ResultsPanel::showCharts', arguments);
        },
        buildChart: function(node) {
            // summary:
            //      builds a chart around a node
            // node
            console.log('app.ResulstPanel::buildChart', arguments);

            // Create the chart within it's 'holding' node

            var chartData = [{
                x: 1,
                y: 19021
            }, {
                x: 1,
                y: 12837
            }, {
                x: 1,
                y: 12378
            }, {
                x: 1,
                y: 21882
            }, {
                x: 1,
                y: 17654
            }, {
                x: 1,
                y: 15833
            }, {
                x: 1,
                y: 16122
            }];

            var pieChart = new Chart(node);

            // Set the theme
            green.chart.fill = green.plotarea.fill = '#fff';
            pieChart.setTheme(green);

            // Add the only/default plot
            pieChart.addPlot('default', {
                type: Pie, // our plot2d/Pie module reference as type value
                radius: 200,
                fontColor: 'black',
                labelOffset: -20
            });

            // Add the series of data
            pieChart.addSeries('January', chartData);

            this.own(pieChart);

            return pieChart;
        },
        startup: function() {
            // summary:
            //      startup for rendering
            //
            console.log('app.ResultsPanel::startup', arguments);

            array.forEach(this.charts, function(chart){
                chart.render();
            }, this);
        }
    });
});