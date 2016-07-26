define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/text!app/templates/FilterTitleNode.html',
    'dojo/topic',
    'xstyle/css!app/resources/FilterTitleNode.css'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    domClass,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The button for controlling which filter is displayed

        templateString: template,
        baseClass: 'filter-title-node',
        selectedTopic: config.topics.events.title.selected,

        // Properties to be sent into constructor

        // type: string
        // summary:
        //      the type of button. used for css styling and topic publishing
        //      for styling the text describing the widget
        type: null,

        // controls: widget
        // summary:
        //      the widget that this widget controls visibility for
        controls: null,

        // description: string
        // summary:
        //      the string displayed when the title node is activated
        description: '',

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterTitleNode::postCreate', arguments);

            domClass.add(this.container, this.type);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterTitleNode::setupConnections', arguments);

            this.own(
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        notify: function () {
            // summary:
            //      handles the click event
            console.log('app.FilterTitleNode::notify', arguments);

            topic.publish(this.selectedTopic, { who: this.domNode, type: this.type, description: this.description });
        },
        updateDomState: function (t) {
            // summary:
            //      sets the selected status based on others state
            // t the {who:, type:, description:} topic
            console.log('app.FilterTitleNode::updateDomState', arguments);

            domClass.toggle(this.container, 'selected', t.who === this.domNode);
        }
    });
});
