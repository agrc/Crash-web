define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/text!app/templates/FilterControls.html',
    'dojo/topic'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
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

            //TODO: get all params to pass to filter
            topic.publish(config.topics.search.filter, 'crash_id in (select id from rollup where dui = 1) AND date > \'2014-09-01 07:49:00\'');
        },
        reset: function() {
            // summary:
            //      handles invoking the reset code for all of the filters
            //      and reseting the definition expression on the feature layer
            //
            console.log('app.FilterControls::reset', arguments);

            topic.publish(config.topics.search.filter, '');
            topic.publish(config.topics.search.reset, {});
        }
    });
});