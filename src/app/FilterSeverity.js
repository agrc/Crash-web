define([
    'app/config',
    'app/FilterCommon',

    'dojo/_base/declare',
    'dojo/text!app/templates/FilterSeverity.html'
], function(
    config,
    FilterCommon,

    declare,
    template
) {
    return declare([FilterCommon], {
        // description:
        //      Filter based on how bad a vehicle collision was.

        templateString: template,
        baseClass: 'filter-severity',
        selectedTopic: config.topics.events.title.selected,
        type: 'severity',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterSeverity::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterSeverity::setupConnections', arguments);

            this.inherited(arguments);
        },
        _gatherData: function(){
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterSeverity::_gatherData', arguments);

            var severity = this._getValues(this.domNode);

            this.set('data', {
                severity: severity
            });
        }
    });
});