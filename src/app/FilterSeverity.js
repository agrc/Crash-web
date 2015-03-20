define([
    'app/config',
    'app/FilterCommon',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterSeverity.html',
    'dojo/topic'
], function(
    config,
    FilterCommon,

    declare,
    lang,
    domClass,
    on,
    query,
    template,
    topic
) {
    return declare([FilterCommon], {
        // description:
        //      Filter based on how bad a vehicle collision was.

        templateString: template,
        baseClass: 'filter-severity',
        selectedTopic: config.topics.events.title.selected,
        type: 'severity',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterSeverity::postCreate', arguments);


            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterSeverity::setupConnections', arguments);

            this.inherited(arguments);
        },
        updateDomState: function(t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterSeverity::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        },
        _gatherData: function(){
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterSeverity::_gatherData', arguments);

            var severity = this._getValues(this.domNode);

            this.set('data', {
                severity: severity
            });
        }
    });
});