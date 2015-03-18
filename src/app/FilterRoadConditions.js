define([
    'app/config',
    'app/FilterFactors',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/text!app/templates/FilterRoadConditions.html',
    'dojo/topic'
], function(
    config,
    FilterFactors,

    declare,
    lang,
    domClass,
    on,
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
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
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