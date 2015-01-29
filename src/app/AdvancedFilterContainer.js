define([
    'app/FilterSeverity',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/text!app/templates/AdvancedFilterContainer.html'
], function(
    FilterSeverity,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    declare,
    domClass,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Contains the other useful but not required crash filters

        templateString: template,
        baseClass: 'advanced-filter-container',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.AdvancedFilterContainer::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.AdvancedFilterContainer::setupConnections', arguments);

        },
        toggle: function() {
            // summary:
            //      toggle advanced filters
            console.log('app.AdvancedFilterContainer::toggle', arguments);

            domClass.toggle(this.extraFiltersNode, 'hidden');
        }
    });
});