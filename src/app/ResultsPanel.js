define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/aspect',
    'dojo/dom-class',
    'dojo/keys',
    'dojo/on',
    'dojo/query',
    'dojo/request',
    'dojo/text!app/templates/ResultsPanel.html',
    'dojo/topic',

    'highcharts',
    'xstyle/css!app/resources/ResultsPanel.css'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    aspect,
    domClass,
    keys,
    on,
    query,
    request,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The panel to show graphs charts results from the query

        templateString: template,
        baseClass: 'results-panel',

        // Properties to be sent into constructor
        constructor: function () {
            this.charts = [];
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.ResultsPanel::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.ResultsPanel::setupConnections', arguments);

            this.own(
                on(document, 'keyup', lang.hitch(this, 'hide')),
                aspect.before(this, 'show', lang.hitch(this, lang.partial(this.showProgress, true))),
                aspect.before(this, 'buildChart', lang.hitch(this, lang.partial(this.showProgress, false)))
            );

            topic.subscribe(config.topics.search.filter, lang.hitch(this, 'setCurrentCriteria'));
        },
        setCurrentCriteria: function (criteria) {
            // summary:
            //      sets the current filtering criteria
            // criteria
            console.log('app.ResultsPanel::setCurrentCriteria', arguments);

            this.currentCriteria = criteria;
        },
        hide: function (evt) {
            // summary:
            //      description
            // params
            console.log('app.ResultsPanel::hide', arguments);

            if (evt.type !== 'click') {
                var charOrCode = evt.charCode || evt.keyCode;

                if (charOrCode !== keys.ESCAPE) {
                    return;
                }
            }

            domClass.add(this.domNode, 'hidden');
        },
        show: function () {
            // summary:
            //      shows the panel
            console.log('app.ResultsPanel::show', arguments);

            domClass.remove(this.domNode, 'hidden');
            this.getChartData(this.currentCriteria).then(
                lang.hitch(this, 'buildChart'), this.errorHandler);
        },
        showProgress: function (show) {
            // summary:
            //      reset the current charts and show activity
            //
            console.log('app.ResultsPanel::showProgress', arguments);

            if (show) {
                domClass.remove(this.activity, 'hidden');

                this.charts.forEach(function (chart) {
                    chart.destroy();
                });

                query('.row', this.chartContainer).addClass('hidden');

                this.charts = [];

                return;
            }

            domClass.add(this.activity, 'hidden');
            query('.row', this.chartContainer).removeClass('hidden');
        },
        getChartData: function (criteria) {
            // summary:
            //      xhr
            //
            console.log('app.ResultsPanel::getChartData', arguments);

            return request(config.urls.stats, {
                handleAs: 'json',
                method: 'POST',
                data: { sql: criteria.sql }
            });
        },
        buildChart: function (response) {
            // summary:
            //      builds a chart from a response from an api
            // the response object
            console.log('app.ResultsPanel::buildChart', arguments);

            Object.keys(response).forEach(function (key) {
                var data = response[key];
                var category = null;
                if (data.categories) {
                    category = data.categories;
                }

                var chart = new Highcharts.Chart({
                    chart: {
                        renderTo: data.selector
                    },
                    tooltip: {
                        formatter: function () {
                            return this.y;
                        },
                        shared: true
                    },
                    xAxis: {
                        categories: category
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
                    series: [{
                        name: key,
                        type: data.type,
                        data: data.data
                    }],
                    credits: {
                        enabled: false
                    }
                });

                this.charts.push(chart);
            }, this);
        },
        startup: function () {
            // summary:
            //      startup for rendering
            //
            console.log('app.ResultsPanel::startup', arguments);

        }
    });
});
