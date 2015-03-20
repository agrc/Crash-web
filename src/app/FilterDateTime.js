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
    'dojo/text!app/templates/FilterDateTime.html',
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
        //      Filter crash points by date and time options.

        templateString: template,
        baseClass: 'filter-date-time',
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
                on(this.domNode, events.join(','), lang.hitch(this, '_gatherData'))
            );

            this.inherited(arguments);
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

            var days = this._getValues(this.daysNode);
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
        }
    });
});