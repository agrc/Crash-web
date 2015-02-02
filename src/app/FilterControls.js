define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/date',
    'dojo/date/locale',
    'dojo/text!app/templates/FilterControls.html',
    'dojo/topic'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
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

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterControls::postCreate', arguments);

            this.setupConnections();

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
            var smokingMirrors = 'crash_id in (select id from rollup where dui = 1) AND' +
                ' date > \'2014-09-01 07:49:00\'';
            //TODO: get all params to pass to filter
            topic.publish(config.topics.search.filter, smokingMirrors);
        },
        reset: function() {
            // summary:
            //      handles invoking the reset code for all of the filters
            //      and reseting the definition expression on the feature layer
            //
            console.log('app.FilterControls::reset', arguments);

            topic.publish(config.topics.search.filter, '');
            topic.publish(config.topics.search.reset, {});
        },
        _buildDefinitionQueryFromObject: function(criteria) {
            // summary:
            //      gets the object criteria from the filters and creates a definition query
            // criteria
            console.log('app.FilterControls::_buildDefinitionQueryFromObject', arguments);
            var filters = [];

            if (criteria.date) {
                if (criteria.date.predefined) {
                    var today = criteria.date.today || Date.now();
                    var predefined = date.add(today, 'day', criteria.date.predefined);

                    filters.push('date >= \'' + this._formatDateForArcGis(predefined) + '\'');
                }

                if (criteria.date.toDate && criteria.date.fromDate) {
                    var from = criteria.date.fromDate,
                        to = criteria.date.toDate;

                    filters.push('date BETWEEN \'' + this._formatDateForArcGis(from) +
                                 '\' AND \'' + this._formatDateForArcGis(to) + '\'');
                }

                if (criteria.date.specificDays) {
                    var days = criteria.date.specificDays;

                    filters.push('day IN (' + days.join(',') + ')');
                }

                if (criteria.date.fromTime && criteria.date.toTime) {
                    var fromTime = criteria.date.fromTime,
                        toTime = criteria.date.toTime;

                    filters.push('CAST(date as TIME) BETWEEN \'' + fromTime + '\' AND \'' + toTime + '\'');
                }
            }

            return filters.join(' AND ');
        },
        _formatDateForArcGis: function(d) {
            // summary:
            //      formates the date for definition queries
            // d
            console.log('app.FilterControls::_formatDateForArcGis', arguments);

            return locale.format(d, {
                datePattern: 'yyyy-MM-dd',
                selector: 'date'
            });
        }
    });
});