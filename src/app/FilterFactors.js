define([
    'app/config',
    'app/FilterCommon',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/query',
    'dojo/text!app/templates/FilterFactors.html'
], function(
    config,
    FilterCommon,

    array,
    declare,
    query,
    template
) {
    return declare([FilterCommon], {
        // description:
        //      Filter crashes based on the factors that went into the collision

        templateString: template,
        baseClass: 'filter-factors',
        selectedTopic: config.topics.events.title.selected,
        type: 'factors',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterFactors::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterFactors::setupConnections', arguments);

            this.inherited(arguments);
        },
        _gatherData: function() {
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterFactors::_gatherData', arguments);

            var factors = array.map(query('input[type="checkbox"]:checked', this.domNode), function mapCheckboxes(node){
                return node.value;
            }, this);

            if(factors.length < 1){
                factors = [];
            }

            this.set('data', {
                factors: factors
            });
        }
    });
});