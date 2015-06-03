define([
    'app/config',
    'app/ResultsPanel',
    'app/ControlCommon',

    'dojo/_base/declare',
    'dojo/text!app/templates/FilterControls.html',
    'dojo/topic',

    'xstyle/css!app/resources/FilterControls.css'
], function (
    config,
    ResultsPanel,
    ControlCommon,

    declare,
    template,
    topic
) {
    return declare([ControlCommon], {
        // description:
        //      The controls for interacting with the filter information

        templateString: template,
        baseClass: 'filter-controls',

        // criteria: {}
        // summary:
        //      description
        criteria:  null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterControls::postCreate', arguments);

            this.resultsPanel = new ResultsPanel({}, 'div');
            // place at calls startup
            this.resultsPanel.placeAt('app_center', 'first');

            this.childWidgets.push(this.resultsPanel);

            this.inherited(arguments);
        },
        filter: function () {
            // summary:
            //      handles gathering the filter criteria and sending the request
            console.log('app.FilterControls::filter', arguments);

            var sourceCriteria = this._getFilterCriteria();

            var criteria = this._buildDefinitionQueryFromObject(sourceCriteria);

            if (!criteria.sql) {
                return;
            }

            sourceCriteria.sql = criteria.sql;

            this.criteria = {
                source: sourceCriteria
            };

            this.applySvg.setAttribute('class', 'sprite selected');
            this.resetSvg.setAttribute('class', 'sprite');
            this.chartSvg.setAttribute('class', 'sprite');

            topic.publish(config.topics.search.filter, this.criteria.source.sql);
            topic.publish(config.topics.events.zoom);
        },
        reset: function () {
            // summary:
            //      handles invoking the reset code for all of the filters
            //      and reseting the definition expression on the feature layer
            console.log('app.FilterControls::reset', arguments);

            this.applySvg.setAttribute('class', 'sprite');
            this.resetSvg.setAttribute('class', 'sprite disabled');
            this.chartSvg.setAttribute('class', 'sprite disabled');

            topic.publish(config.topics.search.filter, '');
            topic.publish(config.topics.search.reset, {});
            topic.publish(config.topics.events.fullExtent, {});
        },
        toggleCharts: function () {
            // summary:
            //      shows the charts
            //
            console.log('app.FilterControls::toggleCharts', arguments);

            if (this._svgHasClass(this.chartSvg, 'disabled')) {
                return;
            }

            this.resultsPanel.show();
            this.resultsPanel.displayChartsFor(this.criteria);
        }
    });
});
