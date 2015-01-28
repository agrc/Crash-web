define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/array',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'ijit/widgets/layout/SideBarToggler',

    'app/config',
    'app/MapController',


    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], function(
    template,

    declare,
    array,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    SideBarToggler,

    config,
    MapController
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

        // map: agrc.widgets.map.Basemap
        map: null,

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
                new SideBarToggler({
                    sidebar: this.sideBar,
                    map: this.map,
                    centerContainer: this.centerContainer
                }, this.sidebarToggle)
            );

            this.subscriptions();

            this.inherited(arguments);
        },
        subscriptions: function() {
            // summary:
            //      description
            //
            console.log('app.App::subscriptions', arguments);

            this.own(MapController.map.on('load', function() {
                MapController.addLayerAndMakeVisible({
                    id: 'CrashPoints',
                    url: config.urls.service,
                    serviceType: 'feature'
                });
                MapController.updateOpacity(0.5);
            }));
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