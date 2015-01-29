define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterFactors.html'
], function(
    _TemplatedMixin,
    _WidgetBase,

    declare,
    event,
    domClass,
    on,
    query,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Filter crashes based on the factors that went into the collision

        templateString: template,
        baseClass: 'filter-factors',

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

            var self = this;
            this.own(
                on(this.domNode, 'label:click', self.clicked)
            );
        },
        clicked: function(evt) {
            // summary:
            //      click handler
            // evt: the click event
            console.log('app.FilterFactors::clicked', arguments);

            // stop input event from bubbling
            event.stop(evt);

            var factor = evt.target.parentNode;

            domClass.toggle(factor, 'btn-success');
        }
    });
});