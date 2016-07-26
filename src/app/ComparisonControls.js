define([
    'app/ControlCommon',
    'app/config',

    'dojo/_base/declare',
    'dojo/text!app/templates/ComparisonControls.html',
    'dojo/topic',

    'xstyle/css!app/resources/ComparisonControls.css'
], function (
    ControlCommon,
    config,

    declare,
    template,
    topic
) {
    return declare([ControlCommon], {
        // description:
        //      The buttons for use when adding a chart comparison
        templateString: template,
        baseClass: 'comparison-controls',

        // Properties to be sent into constructor

        // currentCriteria: string
        // summary:
        //      the sql string of the current chart filter
        currentCriteria: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.ComparisonControls::postCreate', arguments);

        },
        filter: function () {
            // summary:
            //      applies the comparison filter
            console.log('app.ComparisonControls::filter', arguments);

            this.comparisonCriteria = this._getFilterCriteria();

            var criteria = this._buildDefinitionQueryFromObject(this.comparisonCriteria);

            if (!criteria.sql) {
                return;
            }

            this.comparisonCriteria.sql = criteria.sql;

            criteria.source = this.currentCriteria.source;
            criteria.compare = this.comparisonCriteria;

            topic.publish(config.topics.charts.display, criteria);

            this.applySvg.setAttribute('class', 'sprite selected');
            this.resetSvg.setAttribute('class', 'sprite');
        },
        reset: function () {
            // summary:
            //      resets the filter
            console.log('app.ComparisonControls::reset', arguments);

            this.applySvg.setAttribute('class', 'sprite');
            this.resetSvg.setAttribute('class', 'sprite disabled');
        },
        close: function () {
            // summary:
            //      toggles the visibility of the filter
            //
            console.log('app.ComparisonControls::close', arguments);

            topic.publish(config.topics.events.hideComparisonFilter, {});
        }
    });
});
