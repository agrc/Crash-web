define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/text!app/templates/FilterDateTime.html'
], function(
    _TemplatedMixin,
    _WidgetBase,

    declare,
    domClass,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Filter crash points by date and time options.

        templateString: template,
        baseClass: 'filter-date-time',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterDateTime::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterDateTime::setupConnections', arguments);

        },
        toggle: function() {
            // summary:
            //      show and hide the extra date filters
            //
            console.log('app.FilterDateTime::toggle', arguments);

            domClass.toggle(this.extraFiltersNode, 'hidden');
        }
    });
});