/* global Highcharts */
define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/text!app/templates/Chart.html',

    'highcharts',

    'xstyle/css!app/resources/Chart.css'
], function (
    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,

    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      handles rendering and changing chart types
        templateString: template,
        baseClass: 'chart',

        // charts: highcharts
        // summary:
        //      connection to the chart objects
        chart: null,

        // Properties to be sent into constructor

        // data: object
        // summary:
        //      { weather: { categories: [], series: [{ type, data: []}] } }
        data: null,

        // category: []
        // summary:
        //      the label categories
        category: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.Chart::postCreate', arguments);

            this.charts = [];

            this.setupConnections();

            this.inherited(arguments);
        },
        syncSelectorNode: function (value) {
            // summary:
            //    keeps the drop down box in sync with the charts

            var lookup = ['pie', 'bar', 'line'];
            this.selectorNode.selectedIndex = lookup.indexOf(value);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app.Chart::setupConnections', arguments);

        },
        render: function (chartType) {
            // summary:
            //      render chart
            // chartType:
            //      the type of chart, pie, bar, line
            console.log('app.Chart::render', arguments);

            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }

            if (chartType) {
                if (chartType.target) {
                    chartType = this.selectorNode.value;
                }

                this.data.series.forEach(function (series) {
                    series.type = chartType;
                });
            } else {
                this.data.series.forEach(function (series) {
                    chartType = series.type;
                });
            }

            this.syncSelectorNode(chartType);

            var series = lang.clone(this.data.series);
            if (chartType === 'pie') {
                for (var i = 0; i < series.length; i++) {
                    series[i].data = series[i].data.filter(function (row) {
                        return row[1] !== 0;
                    });
                }
            }

            this.charts = new Highcharts.Chart({
                chart: {
                    renderTo: this.chartNode,
                    type: chartType
                },
                tooltip: {
                    formatter: function () {
                        var value = this.y;
                        var percent = this.percentage || '';

                        if (percent) {
                            return value + ', ' + Math.round(percent, -2) + '%';
                        }

                        return this.y;
                    },
                    shared: true
                },
                xAxis: {
                    categories: this.category
                },
                yAxis: {
                    type: 'logarithmic'
                },
                title: {
                    text: '',
                    style: {
                        display: 'none'
                    }
                },
                subtitle: {
                    text: '',
                    style: {
                        display: 'none'
                    }
                },
                series: series,
                credits: {
                    enabled: false
                }
            });
        },
        destroy: function () {
            // summary:
            //      destroy the charts
            console.log('app.Chart::destroy', arguments);

            if (this.chart) {
                this.chart.destroy();
                this.chart = null;
            }

            this.inherited(arguments);
        }
    });
});
