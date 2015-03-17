define([
    'app/config',
    'app/data/routes',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/templates/FilterMilepost.html',
    'dojo/topic'
], function(
    config,
    routes,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    lang,
    domClass,
    domConstruct,
    template,
    topic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      filters the layer by milepost to and from

        templateString: template,
        baseClass: 'filter filter-milepost',
        selectedTopic: config.topics.events.title.selected,
        type: 'spatial',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.FilterMilepost::postCreate', arguments);

            this.setupConnections();

            var length = routes.length - 1;
            for (var i = 0; i <= length; i++) {
                var option = domConstruct.toDom(lang.replace('<option value="{0}">{0}</option>', [routes[i]]));
                domConstruct.place(option, this.routeNode);
            }

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.FilterMilepost::setupConnections', arguments);

            this.own(
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        _gatherData: function() {
            // summary:
            //      updates the values from the widget
            // evt
            console.log('app.FilterMilepost::_gatherData', arguments);

            this.set('data',
            {
                milepost: {
                    route: this.routeNode.value || 0,
                    from: +this.startNode.value || 0,
                    to: +this.endNode.value || 0
                }
            });
        },
        updateDomState: function(t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterMilepost::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        }
    });
});