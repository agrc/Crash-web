define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/text!app/templates/FilterDateTime.html',
    'dojo/topic'
], function(
    config,

    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    lang,
    domClass,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Filter crash points by date and time options.

        templateString: template,
        baseClass: 'filter-date-time',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterDateTime::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterDateTime::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.search.gather, lang.hitch(this, 'publishData'))
            );
        },
        publishData: function() {
            // summary:
            //      publishes this widgets filter criteria
            //
            console.log('app.FilterDateTime::publishData', arguments);

            var criteria = this._gatherData();

            topic.publish(config.topics.filter.criteria, criteria);
        },
        _gatherData: function() {
            // summary:
            //      builds the object to publish
            //
            console.log('app.FilterDateTime::_gatherData', arguments);

            var date = {};

            if(this.fromDateNode.value && this.toDateNode.value){
                date.fromDate = this.fromDateNode.value;
                date.toDate = this.toDateNode.value;
            }

            var days = this._getDaysFromSelect(this.daysNode);
            if(days.length > 0){
                date.specificDays = days;
            }

            if(this.fromTimeNode.value && this.toTimeNode.value){
                date.fromTime = this.fromTimeNode.value;
                date.toTime = this.toTimeNode.value;
            }

            return {
                date: date
            };
        },
        _getDaysFromSelect: function(node) {
            // summary:
            //      gets the selected nodes from a filtered select
            // node
            console.log('app.FilterDateTime::_getDaysFromSelect', arguments);

            var optionValues = [];

            array.forEach(node.children, function searchChildren(child){
                if(child.selected){
                    optionValues.push(+child.value);
                }
            }, this);

            return optionValues;
        },
        toggle: function() {
            // summary:
            //      show and hide the extra date filters
            //
            console.log('app.FilterDateTime::toggle', arguments);

            domClass.toggle(this.extraFiltersNode, 'hidden');
        }
    });
});