define([
    'app/config',
    'app/FilterCounty',
    'app/FilterMilepost',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/text!app/templates/FilterSpatial.html',
    'dojo/topic',

    'xstyle/css!app/resources/FilterSpatial.css'
], function (
    config,
    FilterCounty,
    FilterMilepost,

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
        //      Container for spatial widgets
        templateString: template,
        baseClass: 'filter-spatial',
        selectedTopic: config.topics.events.title.selected,
        type: 'spatial',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.FilterSpatial::postCreate', arguments);

            this.County = new FilterCounty({}, this.county);
            this.Milepost = new FilterMilepost({}, this.milepost);
            this.set('data', {});

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      topics, on, stuff
            console.log('app.FilterSpatial::setupConnections', arguments);

            this.own(
                topic.subscribe(this.selectedTopic, lang.hitch(this, 'updateDomState'))
            );
        },
        _getDataAttr: function () {
            var a = this.County.get('data');
            var b = this.Milepost.get('data');

            return lang.mixin(a, b);
        },
        updateDomState: function (t) {
            // summary:
            //      updates the visbility state
            // t the {who:, type:, description:} topic
            console.log('app.FilterCommon::updateDomState', arguments);

            domClass.toggle(this.domNode, 'hidden', t.type !== this.type);
        }
    });
});
