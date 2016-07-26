define([
    'app/ActiveFilters',
    'app/Chart',
    'app/ComparisonControls',
    'app/config',
    'app/FilterDateTime',
    'app/FilterSelector',
    'app/FilterTitleNode',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/aspect',
    'dojo/dom-class',
    'dojo/keys',
    'dojo/on',
    'dojo/query',
    'dojo/request',
    'dojo/text!app/templates/ResultsPanel.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'xstyle/css!app/resources/ResultsPanel.css'
], function (
    ActiveFilters,
    Chart,
    ComparisonControls,
    config,
    FilterDateTime,
    FilterSelector,
    FilterTitleNode,

    _TemplatedMixin,
    _WidgetBase,

    aspect,
    domClass,
    keys,
    on,
    query,
    request,
    template,
    topic,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The panel to show graphs charts results from the query

        templateString: template,
        baseClass: 'results-panel',

        _setFilterLabelAttr: { node: 'filterLabelNode', type: 'innerHTML' },

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

            this.activeFilters = new ActiveFilters({}, this.activeFiltersNode);

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
                aspect.before(this, 'buildChart', lang.hitch(this, lang.partial(this.showProgress, false))),
                topic.subscribe(config.topics.events.hideComparisonFilter, lang.hitch(this, 'toggleComparisonFilter')),
                topic.subscribe(config.topics.charts.display, lang.hitch(this, 'displayChartsFor'))
            );
        },
        setFilterLabel: function (criteria) {
            // summary:
            //      sets the current filtering criteria label
            // criteria
            console.log('app.ResultsPanel::setFilterLabel', arguments);

            var options = {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            var sourceModel = {};
            var compareModel = {};
            var sourceTemplate = '{sourceModel.from} through {sourceModel.to}';
            var comparisonTemplate = 'Comparing {sourceModel.from} through {sourceModel.to}' +
                                     ' and {compareModel.from} through {compareModel.to}';
            var template = sourceTemplate;

            this.set('filterLabel', '');

            var convertTo12 = function (timeString) {
                var H = +timeString.substr(0, 2);
                var h = H % 12 || 12;
                if (h < 10) {
                    h = '0' + h;
                }
                var ampm = H < 12 ? ' AM' : ' PM';

                return h + timeString.substr(2, 3) + ampm;
            };

            var formatTime = function (criteria) {
                return {
                    to: convertTo12(criteria.toTime),
                    from: convertTo12(criteria.fromTime)
                };
            };

            var formatDate = function (criteria) {
                var toDate = new Date(criteria.toDate);
                toDate.setTime(toDate.getTime() + toDate.getTimezoneOffset() * 60 * 1000);

                var fromDate = new Date(criteria.fromDate);
                fromDate.setTime(fromDate.getTime() + fromDate.getTimezoneOffset() * 60 * 1000);

                return {
                    from: fromDate.toLocaleDateString('en-us', options),
                    to: toDate.toLocaleDateString('en-us', options)
                };
            };

            var formatModel = function (model) {
                if (model.date && model.date.from && model.time && model.time.from) {
                    return {
                        from: model.date.from + ' ' + model.time.from,
                        to: model.date.to + ' ' + model.time.to
                    };
                }

                if (model.date && model.date.from) {
                    return model.date;
                }

                if (model.time && model.time.from) {
                    return model.time;
                }

                return null;
            };
            this.activeFilters.set('source', criteria.source);
            this.activeFilters.set('compare', criteria.compare);

            // return if there is no source. nothing to graph.
            if (!criteria.source || !criteria.source.date) {
                return '';
            }

            // use the comparison template if there is a comparison
            if (criteria.compare && criteria.compare.date) {
                template = comparisonTemplate;
                if (criteria.compare.date.toDate) {
                    compareModel.date = formatDate(criteria.compare.date);
                }

                if (criteria.compare.date.toTime) {
                    compareModel.time = formatTime(criteria.compare.date);
                }
            }

            if (criteria.source.date.toDate) {
                sourceModel.date = formatDate(criteria.source.date);
            }

            if (criteria.source.date.toTime) {
                sourceModel.time = formatTime(criteria.source.date);
            }

            sourceModel = formatModel(sourceModel);
            compareModel = formatModel(compareModel);

            if (sourceModel || compareModel) {
                this.set('filterLabel', lang.replace(template, {
                    sourceModel: sourceModel,
                    compareModel: compareModel
                }));
            } else {
                this.set('filterLabel', '');
            }

            return this.get('filterLabel');
        },
        addComparison: function () {
            // summary:
            //      creates and displays the date/time widget for chart comparisons
            console.log('app.ResultsPanel::addComparison', arguments);

            if (!this.filterSelector) {
                this.filterSelector = new FilterSelector({
                    FilterControls: ComparisonControls,
                    tabs: [
                        new FilterTitleNode({
                            type: 'calendar',
                            description: 'Date and Time Factors'
                        })
                    ],
                    filters: [
                        FilterDateTime
                    ]
                }, this.filterNode);
            }

            this.filterSelector.filterControls.currentCriteria = this.currentCriteria;

            domClass.remove(this.filterSelector.domNode, 'hidden');
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
        },
        toggleComparisonFilter: function () {
            // summary:
            //      hides and shows the comparison filter node
            console.log('app.ResultsPanel::toggleComparisonFilter', arguments);

            domClass.toggle(this.filterSelector.domNode, 'hidden');
        },
        displayChartsFor: function (criteria) {
            // summary:
            //      xhr request to stats api and build charts
            // criteria
            console.log('app.ResultsPanel::displayChartsFor', arguments);

            this.currentCriteria = criteria;
            this.setFilterLabel(criteria);
            this.getChartData(criteria).then(
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

            var data = {
                sql: lang.getObject('source.sql', false, criteria),
                comparison: lang.getObject('compare.sql', false, criteria)
            };

            return request(config.urls.stats, {
                handleAs: 'json',
                method: 'POST',
                data: data
            });
        },
        buildChart: function (response) {
            // summary:
            //      builds a chart from a response from an api
            // the response object
            console.log('app.ResultsPanel::buildChart', arguments);

            this.charts.forEach(function (chart) {
                chart.destroy();
            });

            this.charts = [];

            var chartData = Object.keys(response);

            if (!chartData || chartData.length > 10 || chartData.length < 1) {
                return this.errorHandler();
            }

            chartData.forEach(function (key) {
                var data = response[key];
                var category = lang.getObject('categories', false, data);

                var chart = new Chart({
                    data: data,
                    category: category
                }).placeAt(this[data.selector]);

                chart.render();

                this.charts.push(chart);
            }, this);
        },
        errorHandler: function () {
            // summary:
            //      error handler
            //
            console.log('app.ResultsPanel::errorHandler', arguments);

            alert('something went wrong.');
        }
    });
});
