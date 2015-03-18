define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

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

    _TemplatedMixin,
    _WidgetBase,

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
    return declare([_WidgetBase, _TemplatedMixin], {
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

            this.own(
                on(this.domNode, 'input[type="checkbox"]:change', lang.hitch(this, 'clicked')),
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
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

            domClass.toggle(factor, 'selected');
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