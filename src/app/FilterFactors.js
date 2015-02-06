define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterFactors.html'
], function(
    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    event,
    lang,
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

            this.own(
                on(this.domNode, 'input[type="checkbox"]:change', lang.hitch(this, 'clicked'))
            );
        },
        clicked: function(evt) {
            // summary:
            //      click handler
            // evt: the click event
            console.log('app.FilterFactors::clicked', arguments);

            // stop input event from bubbling
            event.stop(evt);

            var factor = evt.target.parentNode.parentNode;

            domClass.toggle(factor, 'btn-success');
            this._gatherData();
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
                factors = null;
            }

            this.set('data', {
                factors: factors
            });
        }
    });
});