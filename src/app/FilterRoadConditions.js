define([
    'app/config',
    'app/FilterCommon',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterRoadConditions.html'
], function(
    config,
    FilterCommon,

    array,
    declare,
    event,
    lang,
    domClass,
    on,
    query,
    template
) {
    return declare([FilterCommon], {
        // description:
        //      Filter the crashes by the conditions of the road at the time

        templateString: template,
        baseClass: 'filter-conditions',
        selectedTopic: config.topics.events.title.selected,
        type: 'weather',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterRoadConditions::postCreate', arguments);

            this.inherited(arguments);

            this.setupConnections();
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterRoadConditions::setupConnections', arguments);

            this.inherited(arguments);
        },
        _gatherData: function() {
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterRoadConditions::_gatherData', arguments);

            var roadConditions = array.map(query('input[type="checkbox"]:checked', this.domNode),
                function mapCheckboxes(node) {
                    return node.value;
                }, this);

            if (roadConditions.length < 1) {
                roadConditions = [];
            }

            this.set('data', {
                roadConditions: roadConditions
            });
        }
    });
});