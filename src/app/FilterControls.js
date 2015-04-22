define([
    'app/config',
    'app/ResultsPanel',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/date',
    'dojo/date/locale',
    'dojo/text!app/templates/FilterControls.html',
    'dojo/topic',

    'xstyle/css!app/resources/FilterControls.css'
], function(
    config,
    ResultsPanel,

    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    lang,
    date,
    locale,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The controls for interacting with the filter information

        templateString: template,
        baseClass: 'filter-controls',

        // Properties to be sent into constructor

        constructor: function() {
            this.childWidgets = [];
            this.filters = [];
        },

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterControls::postCreate', arguments);

            this.setupConnections();

            this.resultsPanel = new ResultsPanel({}, 'div');
            // place at calls startup
            this.resultsPanel.placeAt('app_center', 'first');

            this.childWidgets.push(this.resultsPanel);

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterControls::setupConnections', arguments);
        },
        filter: function() {
            // summary:
            //      handles gathering the filter criteria and sending the request
            //
            console.log('app.FilterControls::filter', arguments);

            var criteria = this._getFilterCriteria();
            criteria = this._buildDefinitionQueryFromObject(criteria);

            if (!criteria.sql) {
                return;
            }

            this.applySvg.setAttribute('class', 'sprite selected');
            this.resetSvg.setAttribute('class', 'sprite');
            this.chartSvg.setAttribute('class', 'sprite');

            topic.publish(config.topics.search.filter, criteria);
        },
        reset: function() {
            // summary:
            //      handles invoking the reset code for all of the filters
            //      and reseting the definition expression on the feature layer
            //
            console.log('app.FilterControls::reset', arguments);

            if(this._svgHasClass(this.resetSvg, 'disabled')){
                return;
            }

            this.applySvg.setAttribute('class', 'sprite');
            this.resetSvg.setAttribute('class', 'sprite disabled');
            this.chartSvg.setAttribute('class', 'sprite disabled');

            topic.publish(config.topics.search.filter, '');
            topic.publish(config.topics.search.reset, {});
        },
        toggleCharts: function() {
            // summary:
            //      shows the charts
            //
            console.log('app.FilterControls::toggleCharts', arguments);

            if(this._svgHasClass(this.chartSvg, 'disabled')){
                return;
            }

            this.resultsPanel.show();
        },
        _getFilterCriteria: function() {
            // summary:
            //      gets the filter criteria from the filters array
            //
            console.log('app.FilterControls::_getFilterCriteria', arguments);

            var criteria = {};

            array.forEach(this.filters, function mixinCriteria(widget) {
                lang.mixin(criteria, widget.get('data'));
            }, this);

            return criteria;
        },
        _buildDefinitionQueryFromObject: function(criteria) {
            // summary:
            //      gets the object criteria from the filters and creates a definition query
            // criteria
            console.log('app.FilterControls::_buildDefinitionQueryFromObject', arguments);
            var result = this._buildShape(criteria);
            var filters = this._buildConditions(criteria);

            filters = filters.concat(this._buildDate(criteria));
            filters = filters.concat(this._buildFactors(criteria));
            filters = filters.concat(this._buildSpatial(criteria));

            result.sql = filters.join(' AND ');

            return result;
        },
        _buildDate: function(criteria) {
            // summary:
            //      description
            // filters
            console.log('app.FilterControls::_buildDate', arguments);

            var filters = [];
            if (criteria.date) {
                if (criteria.date.predefined) {
                    var today = criteria.date.today || Date.now();
                    var predefined = date.add(today, 'day', criteria.date.predefined);

                    filters.push('CRASHLOCATION.date >= \'' + this._formatDateForArcGis(predefined) + '\'');
                }

                if (criteria.date.toDate && criteria.date.fromDate) {
                    var from = criteria.date.fromDate,
                        to = criteria.date.toDate;

                    filters.push('CRASHLOCATION.date BETWEEN \'' + this._formatDateForArcGis(from) +
                        '\' AND \'' + this._formatDateForArcGis(to) + '\'');
                }

                if (criteria.date.specificDays) {
                    var days = criteria.date.specificDays;

                    filters.push('CRASHLOCATION.day IN (' + days.join(',') + ')');
                }

                if (criteria.date.fromTime && criteria.date.toTime) {
                    var fromTime = criteria.date.fromTime,
                        toTime = criteria.date.toTime;

                    filters.push('CAST(CRASHLOCATION.date as TIME) BETWEEN \'' + fromTime + '\' AND \'' + toTime + '\'');
                }
            }

            return filters;
        },
        _buildFactors: function(criteria) {
            // summary:
            //      build the factors
            // criteria
            console.log('app.FilterControls::_buildFactors', arguments);

            var filters = [];
            if (criteria.factors && criteria.factors.length) {
                var factors = array.map(criteria.factors, function formatFactors(factor) {
                    return factor + '=1';
                });

                var factorClause = factors.join(' AND ');

                filters.push('crash_id IN (SELECT id FROM DDACTS.DDACTSadmin.Rollup WHERE ' + factorClause + ')');
            }

            return filters;
        },
        _buildSpatial: function(criteria) {
            // summary:
            //      description
            // criteria
            console.log('app.FilterControls::_buildSpatial', arguments);

            var filters = [];
            if (criteria.milepost) {
                var milepost = criteria.milepost;
                filters.push('route_number = ' + milepost.route +
                    ' AND milepost BETWEEN ' + milepost.from + ' AND ' + milepost.to);
            }

            return filters;
        },
        _buildConditions: function(criteria) {
            // summary:
            //      description
            // criteria
            console.log('app.FilterControls::_buildConditions', arguments);

            var filters = [];

            if (criteria.weatherConditions && criteria.weatherConditions.length) {
                filters.push('weather_condition in (' + criteria.weatherConditions.join(',') + ')');
            }

            return filters;
        },
        _buildShape: function(criteria) {
            // summary:
            //      description
            // criteria
            console.log('app.FilterControls::_buildShape', arguments);

            var result = {};

            if (criteria.shape) {
                result.shape = criteria.shape;
            }

            return result;
        },
        _formatDateForArcGis: function(d) {
            // summary:
            //      formates the date for definition queries
            // d
            console.log('app.FilterControls::_formatDateForArcGis', arguments);

            if(Object.prototype.toString.call(d) !== '[object Date]')
            {
                d = new Date(d);
            }

            return locale.format(d, {
                datePattern: 'yyyy-MM-dd',
                selector: 'date'
            });
        },
        startup: function() {
            // summary:
            //      startup stuff
            //
            console.log('app.FilterControls::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        _svgHasClass: function(svg, css) {
            // summary:
            //      returns true if svg node has the class
            // svg, class
            console.log('app.FilterControls::_svgHasClass', arguments);

            return ((' ' + svg.className.baseVal + ' ').indexOf(' ' + css + ' ') >= 0);
        }
    });
});