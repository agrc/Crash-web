define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterSeverity.html',
    'dojo/topic'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    domClass,
    on,
    query,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Filter based on how bad a vehicle collision was.

        templateString: template,
        baseClass: 'filter filter-severity',
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

            var self = this;
            this.own(
                on(this.domNode, 'button:click', function(evt) {
                    self.clearSelection(evt);
                    self.clicked(evt);
                }),
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        clearSelection: function(evt) {
            // summary:
            //      clears all selections
            //
            console.log('app.FilterSeverity::clearSelection', arguments);

            query('button', this.domNode).forEach(function(node) {
                if (node === evt.target) {
                    return;
                }

                domClass.remove(node, 'btn-success');
            });
        },
        clicked: function(evt) {
            // summary:
            //      click handler
            // evt: the click event
            console.log('app.FilterSeverity::clicked', arguments);

            var factor = evt.target;

            domClass.toggle(factor, 'btn-success');
        },
        updateDomState: function(t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterSeverity::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        }
    });
});