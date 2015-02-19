/* global L */
define([
    'dojo/text!app/templates/FilterDraw.html',

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
        //      A widget to endable drawing a polygon

        templateString: template,
        baseClass: 'filter-draw',

        // polygon draw layer
        polygonDrawer: null,

        // Properties to be sent into constructor

        map: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterDraw::postCreate', arguments);

            this.polygonDrawer = new L.Draw.Polygon(this.map);
            this.setupConnections();

            this.inherited(arguments);
        },
        activate: function() {
            // summary:
            //      description
            //
            console.log('app.FilterDraw::activate', arguments);

            this.polygonDrawer.enable();
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterDraw::setupConnections', arguments);

        }
    });
});
