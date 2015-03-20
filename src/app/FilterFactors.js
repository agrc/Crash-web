define([
    'app/config',
    'app/FilterCommon',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterFactors.html',
    'dojo/topic'
], function(
    config,
    FilterCommon,

    array,
    declare,
    event,
    lang,
    domClass,
    on,
    query,
    template,
    topic
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
        },
        updateDomState: function(t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterFactors::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        }
    });
});