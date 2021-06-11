define([
    'app/config',
    'app/FilterControls',
    'app/FilterDateTime',
    'app/FilterFactors',
    'app/FilterSelector',
    'app/FilterSeverity',
    'app/FilterSpatial',
    'app/FilterTitleNode',
    'app/FilterWeatherConditions',
    'app/MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/text!app/templates/App.html'
], function (
    config,
    FilterControls,
    FilterDateTime,
    FilterFactors,
    FilterSelector,
    FilterSeverity,
    FilterSpatial,
    FilterTitleNode,
    FilterWeatherConditions,
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

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;
            this.date.innerHTML = 'Data available from ' + config.minDate + ' through ' + config.maxDate;

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
                    FilterSpatial,
                    FilterWeatherConditions
                ],
                FilterControls: FilterControls
            }, this.sideBar);

            this.childWidgets.push(
                MapController,
                this.filterSelector
            );

            this.subscriptions();

            this.inherited(arguments);
        },
        subscriptions: function () {
            // summary:
            //      description
            //
            console.log('app.App::subscriptions', arguments);

            var initMapLayers = function () {
                MapController.addLayerAndMakeVisible({
                    id: 'CrashPoints',
                    url: config.urls.service,
                    points: config.urls.points,
                    serviceType: 'clustered',
                    distance: 75,
                    displayFieldName: 'objectid',
                    labelColor: '#fff',
                    maxSingles: 1000,
                    outFields: [
                        'objectid',
                        'severity',
                        'crash_date',
                        'weather_condition',
                        'event',
                        'collision_type',
                        'road_name',
                        'road_condition'
                    ]
                });
            };

            if (MapController.map.loaded) {
                initMapLayers();

                return;
            }
            this.own(
                MapController.map.on('load', initMapLayers)
            );
        },
        toggle: function () {
            // summary:
            //      hide and show the menu
            //
            console.log('app.App::toggle', arguments);

            domClass.toggle(this.filterSelector.domNode, 'hidden');
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                console.log(widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        }
    });
});
