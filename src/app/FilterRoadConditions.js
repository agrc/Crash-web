define([
    'app/FilterFactors',

    'dojo/_base/declare',
    'dojo/text!app/templates/FilterRoadConditions.html'
], function(
    FilterFactors,

    declare,
    template
) {
    return declare([FilterFactors], {
        // description:
        //      Filter the crashes by the conditions of the road at the time

        templateString: template,
        baseClass: 'filter-factors',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterRoadConditions::postCreate', arguments);

            this.inherited(arguments);
        }
    });
});