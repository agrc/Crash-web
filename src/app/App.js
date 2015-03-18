define([
    'app/AdvancedFilterContainer',
    'app/config',
    'app/FilterControls',
    'app/FilterDateTime',
    'app/FilterFactors',
    'app/FilterSelector',
    'app/MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/text!app/templates/App.html',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], function(
    AdvancedFilterContainer,
    config,
    FilterControls,
    FilterDateTime,
    FilterFactors,
    FilterSelector,
    MapController,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    array,
    declare,
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

            this.childWidgets.push(
                MapController,
                new FilterSelector({
                    filters: [
                        // FilterDateTime,
                        FilterFactors
                        // AdvancedFilterContainer
                    ]
                }, this.sideBar)
            );

            this.subscriptions();

            this.inherited(arguments);
        },
        subscriptions: function() {
            // summary:
            //      description
            //
            console.log('app.App::subscriptions', arguments);

            // this.own(
            //     MapController.map.on('load', function() {
            //         MapController.addLayerAndMakeVisible({
            //             id: 'CrashPoints',
            //             url: config.urls.service,
            //             serviceType: 'clustered',
            //             distance: 75,
            //             displayFieldName: 'objectid',
            //             labelColor: '#fff',
            //             maxSingles: 1000,
            //             outFields: [
            //                 'objectid',
            //                 'severity',
            //                 'date',
            //                 'weather_condition',
            //                 'event',
            //                 'collision_type',
            //                 'road_name',
            //                 'road_condition'
            //             ]
            //         });
            //     })
            // );
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