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
    'dojo/text!app/templates/FilterDateTime.html',
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
        //      Filter crash points by date and time options.

        templateString: template,
        baseClass: 'filter filter-date-time',
        selectedTopic: config.topics.events.title.selected,
        type: 'calendar',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterDateTime::postCreate', arguments);

            this.set('data', {});

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterDateTime::setupConnections', arguments);

            var events = [
                'input:change',
                'input:input',
            ];
            this.own(
                on(this.domNode, events.join(','), lang.hitch(this, '_gatherData')),
                on(this.domNode, 'input[type="checkbox"]:change', lang.hitch(this, 'updateButtonState')),
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        _gatherData: function() {
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterDateTime::_gatherData', arguments);

            var date = {};

            if (this.fromDateNode.value && this.toDateNode.value) {
                date.fromDate = this.fromDateNode.value;
                date.toDate = this.toDateNode.value;
            }

            var days = this._getDaysFromSelect(this.daysNode);
            if (days.length > 0) {
                date.specificDays = days;
            }

            if (this.fromTimeNode.value && this.toTimeNode.value) {
                date.fromTime = this.fromTimeNode.value;
                date.toTime = this.toTimeNode.value;
            }

            this.set('data', {
                date: date
            });
        },
        updateButtonState: function(evt) {
            // summary:
            //      click handler
            // evt: the click event
            console.log('app.FilterDateTime::updateButtonState', arguments);

            // stop input event from bubbling
            event.stop(evt);

            var factor = evt.target.parentNode.parentNode;

            domClass.toggle(factor, 'selected');
        },
        _getDaysFromSelect: function(node) {
            // summary:
            //      gets the selected nodes from a filtered select
            // node
            console.log('app.FilterDateTime::_getDaysFromSelect', arguments);

            var factors = array.map(query('input[type="checkbox"]:checked', this.domNode), function mapCheckboxes(node){
                return node.value;
            }, this);

            if(factors.length < 1){
                factors = [];
            }

            return factors;
        },
        updateDomState: function(t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterDateTime::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        }
    });
});