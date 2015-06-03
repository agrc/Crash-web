define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/text!app/templates/FilterSelector.html',
    'dojo/topic',
    'xstyle/css!app/resources/FilterSelector.css'
], function (
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
        //      Allows you to pick which filter to show

        templateString: template,
        baseClass: 'filter-selector',

        // Properties to be sent into constructor

        // FilterControls: app/FilterControls
        // summary:
        //      the controls to place in the control node
        FilterControls:  null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterSelector::postCreate', arguments);

            this.setupConnections();

            this.childWidgets = this.childWidgets || [];

            array.forEach(this.tabs, function (Tab) {
                this.childWidgets.push(Tab.placeAt(this.titleNode, 'last'));
            }, this);

            this.filterControls = new this.FilterControls({}, this.controlNode);

            this.childWidgets.push(this.filterControls);

            array.forEach(this.filters, function (Filter) {
                var filter = new Filter().placeAt(this.filterNode, 'last');
                domClass.add(filter.domNode, 'hidden');
                this.childWidgets.push(filter);

                this.filterControls.filters.push(filter);
            }, this);

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterSelector::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.events.title.selected, lang.hitch(this, 'updateDomState'))
            );

        },
        updateDomState: function (t) {
            // summary:
            //      updates the text published from the filter title node
            // t the {who:, type:, description:} topic
            console.log('app.FilterSelector::updateDomState', arguments);

            this.descriptionNode.innerHTML = t.description;
        }
    });
});
