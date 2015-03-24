define([
    'app/config',
    'app/FilterDateTime',
    'app/FilterFactors',
    'app/FilterMilepost',
    'app/FilterRoadConditions',
    'app/FilterSelector',
    'app/FilterSeverity',
    'app/FilterTitleNode',
    'app/MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/text!app/templates/App.html'
], function(
    config,
    FilterDateTime,
    FilterFactors,
    FilterMilepost,
    FilterRoadConditions,
    FilterSelector,
    FilterSeverity,
    FilterTitleNode,
    MapController,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
    domClass,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            MapController.init({
                mapDiv: this.mapDiv
            });

            this.filterSelector = new FilterSelector({
                tabs: [
                    new FilterTitleNode({
                        type: 'calendar',
                        description: 'Date and Time Factors'
                    }),
                    new FilterTitleNode({
                        type: 'spatial',
                        description: 'Spatial Factors'
                    }),
                    new FilterTitleNode({
                        type: 'factors',
                        description: 'Contributing Factors'
                    }),
                    new FilterTitleNode({
                        type: 'severity',
                        description: 'Crash Severity'
                    }),
                    new FilterTitleNode({
                        type: 'weather',
                        description: 'Weather Condition Factors'
                    })
                ],
                filters: [
                    FilterDateTime,
                    FilterFactors,
                    FilterSeverity,
                    FilterMilepost,
                    FilterRoadConditions
                ]
            }, this.sideBar);

            this.childWidgets.push(
                MapController,
                this.filterSelector
            );

            this.subscriptions();

            this.inherited(arguments);
        },
        subscriptions: function() {
            // summary:
            //      description
            //
            console.log('app.App::subscriptions', arguments);

            this.own(
                MapController.map.on('load', function() {
                    MapController.addLayerAndMakeVisible({
                        id: 'CrashPoints',
                        url: config.urls.service,
                        points: 'points.json',
                        serviceType: 'clustered',
                        distance: 75,
                        displayFieldName: 'objectid',
                        labelColor: '#fff',
                        maxSingles: 1000,
                        outFields: ['objectid']
                    });
                })
            );
        },
        toggle: function() {
            // summary:
            //      hide and show the menu
            //
            console.log('app.App::toggle', arguments);

            domClass.toggle(this.filterSelector.domNode, 'hidden');
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function(widget) {
                console.log(widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        }
    });
});