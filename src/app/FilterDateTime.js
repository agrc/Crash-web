define([
    'dojo/text!app/templates/FilterDateTime.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
], function(
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin
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

        }
    });
});