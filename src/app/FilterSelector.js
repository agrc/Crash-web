define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/text!app/templates/FilterSelector.html'
], function(
    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Allows you to pick which filter to show

        templateString: template,
        baseClass: 'filter-selector',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterSelector::postCreate', arguments);

            this.setupConnections();

            this.childWidgets = this.childWidgets || [];

            array.forEach(this.filters, function(Filter){
                this.childWidgets.push(new Filter().placeAt(this.filterNode, 'last'));
            }, this);

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterSelector::setupConnections', arguments);

        }
    });
});