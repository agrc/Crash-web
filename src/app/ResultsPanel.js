define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/keys',
    'dojo/on',
    'dojo/request',
    'dojo/text!app/templates/ResultsPanel.html',
    'dojo/topic',

    'highcharts',
    'xstyle/css!app/resources/ResultsPanel.css'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    domClass,
    keys,
    on,
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

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.ResultsPanel::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.ResultsPanel::setupConnections', arguments);

            this.own(on(document, 'keyup', lang.hitch(this, 'hide')));

            topic.subscribe(config.topics.search.filter, lang.hitch(this, 'setCurrentCriteria'));
        },
        setCurrentCriteria: function(criteria) {
            // summary:
            //      sets the current filtering criteria
            // criteria
            console.log('app.ResultsPanel::setCurrentCriteria', arguments);

            this.currentCriteria = criteria;
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

            domClass.add(this.domNode, 'hidden');
        },
        show: function() {
            // summary:
            //      shows the panel
            console.log('app.ResultsPanel::show', arguments);

            domClass.remove(this.domNode, 'hidden');
            this.getChartData(this.currentCriteria).then(this.buildChart, this.errorHandler);
        },
        getChartData: function(criteria) {
            // summary:
            //      xhr
            //
            console.log('app.ResultsPanel::getChartData', arguments);

            return request('../api/stats/' + criteria.sql, {
                handleAs: 'json'
            });
        },
        buildChart: function(response) {
            // summary:
            //      builds a chart from a response from an api
            // the response object
            console.log('app.ResultsPanel::buildChart', arguments);

            Object.keys(response).forEach(function(key){
                var data = response[key];
                var category = null;
                if(data.categories)
                {
                    category = data.categories;
                }

                new Highcharts.Chart({
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
                    series:[{
                        name: key,
                        type: data.type,
                        data: data.data
                    }],
                    credits: {
                        enabled: false
                    }
                });
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