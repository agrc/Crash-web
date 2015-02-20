define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/text!app/templates/FilterDraw.html',
    'dojo/topic'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      A widget to endable drawing a polygon

        templateString: template,
        baseClass: 'filter-draw',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterDraw::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterDraw::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.map.graphic.add, lang.hitch(this, '_gatherData'))
            );
        },
        activate: function() {
            // summary:
            //      description
            //
            console.log('app.FilterDraw::activate', arguments);

            topic.publish(config.topics.map.drawing.activate, 'polygon');
        },
        clear: function() {
            // summary:
            //      clears graphics
            //
            console.log('app.FilterDraw::clear', arguments);

            topic.publish(config.topics.map.drawing.clear);
        },
        _gatherData: function(graphic) {
            // summary:
            //      gets the user drawn shape and sets it as the data source
            // graphic
            console.log('app.FilterDraw::_gatherData', arguments);

            this.set('data', {
                shape: graphic
            });
        }
    });
});
