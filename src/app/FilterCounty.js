define([
    'app/config',
    'app/FilterCommon',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/templates/FilterCounty.html',

    'xstyle/css!app/resources/FilterCounty.css'
], function (
    config,
    FilterCommon,

    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    lang,
    domClass,
    domConstruct,
    query,
    template
) {
    return declare([FilterCommon], {
        // description:
        //      Filter results by county

        templateString: template,
        baseClass: 'filter filter-county',
        selectedTopic: config.topics.events.title.selected,
        type: 'spatial',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterCounty::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterCounty::setupConnections', arguments);

            this.inherited(arguments);
        },
        _gatherData: function () {
            // summary:
            //      gets the data from the widget
            console.log('app.FilterCounty::_gatherData', arguments);

            var counties = array.map(query('input[type="checkbox"]:checked', this.domNode),
                function mapCheckboxes(node) {
                    return node.value;
                }, this);

            if (counties.length < 1) {
                counties = [];
            }

            this.set('data', {
                counties: counties
            });
        }
    });
});
