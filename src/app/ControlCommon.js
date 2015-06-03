define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/text!app/templates/ControlCommon.html',

    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/date',
    'dojo/date/locale',

    'xstyle/css!app/resources/ControlCommon.css'
], function (
    _TemplatedMixin,
    _WidgetBase,

    declare,
    template,

    array,
    lang,
    date,
    locale
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      base class for the control buttons
        templateString: template,
        baseClass: 'control-common',

        // Properties to be sent into constructor

        constructor: function () {
            this.childWidgets = [];
            this.filters = [];
        },

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.ControlCommon::postCreate', arguments);

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      startup stuff
            //
            console.log('app.ControlCommon::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        _getFilterCriteria: function () {
            // summary:
            //      gets the filter criteria from the filters array
            //
            console.log('app.ControlCommon::_getFilterCriteria', arguments);

            var criteria = {};

            array.forEach(this.filters, function mixinCriteria(widget) {
                lang.mixin(criteria, widget.get('data'));
            }, this);

            return criteria;
        },
        _buildDefinitionQueryFromObject: function (criteria) {
            // summary:
            //      gets the object criteria from the filters and creates a definition query
            // criteria
            console.log('app.ControlCommon::_buildDefinitionQueryFromObject', arguments);
            var result = this._buildShape(criteria);
            var filters = this._buildConditions(criteria);

            filters = filters.concat(this._buildDate(criteria));
            filters = filters.concat(this._buildFactors(criteria));
            filters = filters.concat(this._buildSpatial(criteria));
            filters = filters.concat(this._buildSeverity(criteria));

            result.sql = filters.join(' AND ');

            return result;
        },
        _buildDate: function (criteria) {
            // summary:
            //      description
            // filters
            console.log('app.ControlCommon::_buildDate', arguments);

            var filters = [];
            if (criteria.date) {
                if (criteria.date.predefined) {
                    var today = criteria.date.today || Date.now();
                    var predefined = date.add(today, 'day', criteria.date.predefined);

                    filters.push('DDACTS.DDACTSadmin.CRASHLOCATION.crash_date >= \'' +
                                 this._formatDateForArcGis(predefined) + '\'');
                }

                if (criteria.date.toDate && criteria.date.fromDate) {
                    var from = criteria.date.fromDate;
                    var to = criteria.date.toDate;

                    filters.push('DDACTS.DDACTSadmin.CRASHLOCATION.crash_date BETWEEN \'' +
                        this._formatDateForArcGis(from) +
                        '\' AND \'' + this._formatDateForArcGis(to) + '\'');
                }

                if (criteria.date.specificDays) {
                    var days = criteria.date.specificDays;

                    filters.push('DDACTS.DDACTSadmin.CRASHLOCATION.crash_day IN (' + days.join(',') + ')');
                }

                if (criteria.date.fromTime && criteria.date.toTime) {
                    var fromTime = criteria.date.fromTime;
                    var toTime = criteria.date.toTime;

                    filters.push('CAST(DDACTS.DDACTSadmin.CRASHLOCATION.crash_date as TIME) BETWEEN \'' + fromTime +
                                 '\' AND \'' + toTime + '\'');
                }
            }

            return filters;
        },
        _buildFactors: function (criteria) {
            // summary:
            //      build the factors
            // criteria
            console.log('app.ControlCommon::_buildFactors', arguments);

            var filters = [];
            if (criteria.factors && criteria.factors.length) {
                var factors = array.map(criteria.factors, function formatFactors(factor) {
                    return factor + '=1';
                });

                var factorClause = factors.join(' AND ');

                filters.push('crash_id IN (SELECT id FROM DDACTSadmin.Rollup WHERE ' + factorClause + ')');
            }

            return filters;
        },
        _buildSpatial: function (criteria) {
            // summary:
            //      description
            // criteria
            console.log('app.ControlCommon::_buildSpatial', arguments);

            var filters = [];
            if (criteria.milepost) {
                var milepost = criteria.milepost;
                filters.push('route_number = ' + milepost.route +
                             ' AND milepost BETWEEN ' + milepost.from + ' AND ' + milepost.to);
            }

            if (criteria.counties) {
                var counties = array.map(criteria.counties, function (county) {
                    return '\'' + county + '\'';
                });

                filters.push('county in (' + counties.join(',') + ')');
            }
            return filters;
        },
        _buildConditions: function (criteria) {
            // summary:
            //      description
            // criteria
            console.log('app.ControlCommon::_buildConditions', arguments);

            var filters = [];

            if (criteria.weatherConditions && criteria.weatherConditions.length) {
                filters.push('weather_condition in (' + criteria.weatherConditions.join(',') + ')');
            }

            return filters;
        },
        _buildShape: function (criteria) {
            // summary:
            //      description
            // criteria
            console.log('app.ControlCommon::_buildShape', arguments);

            var result = {};

            if (criteria.shape) {
                result.shape = criteria.shape;
            }

            return result;
        },
        _buildSeverity: function (criteria) {
            // summary:
            //      the crash fatality filter
            // criteria
            console.log('app.ControlCommon::_buildSeverity', arguments);

            var filters = [];

            if (criteria.severity && criteria.severity.length) {
                var severity = array.map(criteria.severity, function (severity) {
                    return '\'' + severity + '\'';
                });

                filters.push('severity in (' + severity.join(',') + ')');
            }

            return filters;
        },
        _formatDateForArcGis: function (d) {
            // summary:
            //      formates the date for definition queries
            // d
            console.log('app.ControlCommon::_formatDateForArcGis', arguments);

            if (Object.prototype.toString.call(d) !== '[object Date]') {
                d = new Date(d);
            }

            return locale.format(d, {
                datePattern: 'yyyy-MM-dd',
                selector: 'date'
            });
        },
        _svgHasClass: function (svg, css) {
            // summary:
            //      returns true if svg node has the class
            // svg, class
            console.log('app.ControlCommon::_svgHasClass', arguments);

            return ((' ' + svg.className.baseVal + ' ').indexOf(' ' + css + ' ') >= 0);
        }
    });
});
