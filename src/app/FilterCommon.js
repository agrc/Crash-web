define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/FilterCommon.html',
    'dojo/topic'
], function(
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
        //      Base class for filters to share functionality

        templateString: template,
        'class': 'filter',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterCommon::postCreate', arguments);

        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterCommon::setupConnections', arguments);

            this.own(
                on(this.domNode, 'input[type="checkbox"]:change', lang.hitch(this, 'updateButtonState')),
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        updateButtonState: function(evt) {
            // summary:
            //      click handler
            // evt: the click event
            console.log('app.FilterCommon::updateButtonState', arguments);

            // stop input event from bubbling
            event.stop(evt);

            var factor = evt.target.parentNode.parentNode;

            domClass.toggle(factor, 'selected');
            this._gatherData();
        },
        _getValues: function(node) {
            // summary:
            //      gets the selected nodes from the checkboxes
            // node: the dom node
            console.log('app.FilterCommon::_getValues', arguments);

            var items = array.map(query('input[type="checkbox"]:checked', this.domNode), function mapCheckboxes(node){
                return node.value;
            }, this);

            if(items.length < 1){
                items = [];
            }

            return items;
        }
    });
});