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
    'dojo/text!app/templates/FilterCommon.html',
    'dojo/topic'
], function (
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
        //      Base class for filters to share functionality

        templateString: template,
        'class': 'filter',
        resetTopic: config.topics.search.reset,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterCommon::postCreate', arguments);

        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterCommon::setupConnections', arguments);

            this.own(
                on(this.domNode, 'input[type="checkbox"]:change', lang.hitch(this, 'updateButtonState')),
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState')),
                topic.subscribe(this.resetTopic, lang.hitch(this, '_reset'))
            );
        },
        updateButtonState: function (evt) {
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
        _getValues: function (node) {
            // summary:
            //      gets the selected nodes from the checkboxes
            // node: the dom node
            console.log('app.FilterCommon::_getValues', arguments);

            node = node || this.domNode;
            var items = array.map(query('input[type="checkbox"]:checked', node), function mapCheckboxes(n) {
                return n.value;
            }, this);

            if (items.length < 1) {
                items = [];
            }

            return items;
        },
        updateDomState: function (t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterCommon::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        },
        _reset: function () {
            // summary:
            //      reset filtering state
            console.log('app.FilterCommon::_reset', arguments);

            query('input', this.domNode).forEach(function (node) {
                if (['text', 'date', 'time'].indexOf(node.type) >= 0) {
                    node.value = '';
                }

                if (['checkbox'].indexOf(node.type) >= 0) {
                    node.checked = false;

                    var checkboxDiv = node.parentNode.parentNode;
                    domClass.remove(checkboxDiv, 'selected');
                }
            });

            this.set('data', {});
        }
    });
});
