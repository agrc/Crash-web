define([
    'app/config',
    'app/FilterCommon',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/query',
    'dojo/text!app/templates/FilterWeatherConditions.html'
], function (
    config,
    FilterCommon,

    array,
    declare,
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

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterWeatherConditions::postCreate', arguments);

            this.inherited(arguments);

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterWeatherConditions::setupConnections', arguments);

            this.inherited(arguments);
        },
        _gatherData: function () {
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterWeatherConditions::_gatherData', arguments);

            var weatherConditions = array.map(query('input[type="checkbox"]:checked', this.domNode),
                function mapCheckboxes(node) {
                    return '\'' + node.value + '\'';
                }, this);

            if (weatherConditions.length < 1) {
                weatherConditions = [];
            }

            this.set('data', {
                weatherConditions: weatherConditions
            });
        }
    });
});
