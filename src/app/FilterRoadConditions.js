define([
    'app/config',
    'app/FilterFactors',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterRoadConditions.html',
    'dojo/topic'
], function(
    config,
    FilterFactors,

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
    return declare([FilterFactors], {
        // description:
        //      Filter the crashes by the conditions of the road at the time

        templateString: template,
        baseClass: 'filter-factors',
        selectedTopic: config.topics.events.title.selected,
        type: 'weather',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterRoadConditions::postCreate', arguments);

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterRoadConditions::setupConnections', arguments);

            this.own(
                on(this.domNode, 'input[type="checkbox"]:change', lang.hitch(this, 'clicked')),
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        clicked: function(evt) {
            // summary:
            //      click handler
            // evt: the click event
            console.log('app.FilterRoadConditions::clicked', arguments);

            // stop input event from bubbling
            event.stop(evt);

            var factor = evt.target.parentNode.parentNode;

            domClass.toggle(factor, 'selected');
            this._gatherData();
        },
        _gatherData: function() {
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterRoadConditions::_gatherData', arguments);

            var roadConditions = array.map(query('input[type="checkbox"]:checked', this.domNode),
                function mapCheckboxes(node) {
                    return node.value;
                }, this);

            if (roadConditions.length < 1) {
                roadConditions = null;
            }

            this.set('data', {
                roadConditions: roadConditions
            });
        },
        updateDomState: function(t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterRoadConditions::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        }
    });
});