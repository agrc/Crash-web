/* global L  */
define([
    'app/config',

    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/topic',

    'mustache/mustache'
], function(
    config,

    array,
    lang,
    topic,

    mustache
) {
    return {
        // description:
        //      Handles interaction between app widgets and the map. Mostly through pub/sub

        // handles: Object[]
        //      container to track handles for this object
        handles: [],

        // childWidgets: array
        // summary:
        //      holds child widgets
        childWidgets: null,

        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function(params) {
            // summary:
            //      description
            console.log('app.MapController::init', arguments);

            lang.mixin(this, params);

            this.childWidgets = [];

            var crs = new L.Proj.CRS('EPSG:26912',
                '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs', {
                    origin: [-5120900, 9998100],
                    resolutions: [
                        4891.96999883583,
                        2445.98499994708,
                        1222.99250010583,
                        611.496250052917,
                        305.748124894166,
                        152.8740625,
                        76.4370312632292,
                        38.2185156316146,
                        19.1092578131615,
                        9.55462890525781,
                        4.77731445262891,
                        2.38865722657904,
                        1.19432861315723,
                        0.597164306578613,
                        0.298582153289307
                    ]
                });

            this.map = new L.Map(this.mapDiv, {
                crs: crs,
                loadingControl: true
            }).setView([39.381, -111.859], 2);

            new L.esri.Layers.TiledMapLayer('http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Hybrid/MapServer', {
                maxZoom: 14,
                minZoom: 0,
                continuousWorld: true,
                attribution: 'State of Utah'
            }).addTo(this.map);

            this.layers = [];

            this.subscriptions();
        },
        subscriptions: function() {
            // summary:
            //      subscribes to topics
            console.log('app.MapController::subscriptions', arguments);

            this.handles.push(
                topic.subscribe(config.topics.search.filter, lang.hitch(this, 'setQueryFilter')),
                // Assumming you have a Leaflet map accessible
                this.map.on('draw:created', function(e) {
                    var type = e.layerType,
                        layer = e.layer;

                    layer.addTo(this.map);
                })
            );
        },
        startup: function() {
            // summary:
            //      startup once app is attached to dom
            console.log('app.MapController::startup', arguments);

            array.forEach(this.childWidgets, function(widget) {
                widget.startup();
            }, this);
        },
        setQueryFilter: function(filterCriteria) {
            // summary:
            //      formats and sets the query filter
            // filterCriteria
            console.log('app.MapController::setQueryFilter', arguments);

            this.activeLayer.setWhere(filterCriteria);
        },
        addLayerAndMakeVisible: function(props) {
            // summary:
            //      description
            // props: object
            //  { url, serviceType, layerIndex, layerProps }
            console.log('app.MapController::addLayerAndMakeVisible', arguments);

            // check to see if layer has already been added to the map
            var lyr;

            var LayerClass;

            switch (props.serviceType || 'dynamic') {
                case 'feature':
                    {
                        break;
                    }
                case 'tiled':
                    {
                        break;
                    }
                case 'clustered':
                    {
                        LayerClass = L.esri.Layers.ClusteredFeatureLayer;
                        break;
                    }
                default:
                    {
                        break;
                    }
            }

            lyr = new LayerClass(props.url, props).addTo(this.map);

            var template = '<h5>{{severity}}</h5>' +
                '<label>Date</label>: {{date}}<br/>' +
                '<label>Event</label>: {{event}}<br/>' +
                '{{#collision_type}}' +
                '<label>Collision Type</label>: {{collision_type}}<br/>' +
                '{{/collision_type}}' +
                '<label>Weather</label>: {{weather_condition}}<br/>' +
                '<label>Road</label>: {{road_name}} was {{road_condition}}';
            mustache.parse(template);

            lyr.bindPopup(function(feature) {
                feature.properties.date = new Date(feature.properties.date).toLocaleString();
                return mustache.render(template, feature.properties);
            });

            this.layers.push({
                id: props.id,
                layer: lyr
            });

            this.activeLayer = lyr;
        },
        updateOpacity: function(opacity) {
            // summary:
            //      changes a layers opacity
            // opacity
            console.log('app.MapController::updateOpacity', arguments);

            if (opacity !== undefined) {
                this.currentOpacity = opacity / 100;
            }

            if (!this.activeLayer) {
                //no layer selected yet return
                return;
            }

            this.activeLayer.layer.setOpacity(this.currentOpacity);
        },
        highlight: function() {
            // summary:
            //      adds the clicked shape geometry to the graphics layer
            //      highlighting it
            // evt - mouse click event
            console.log('app.MapController::highlight', arguments);

        },
        clearGraphic: function(graphic) {
            // summary:
            //      removes the graphic from the map
            // graphic
            console.log('app.MapController::clearGraphic', arguments);

            if (graphic) {
                this.map.graphics.remove(graphic);
                this.graphic = null;
            }
        },
        showPopup: function(mouseEvent) {
            // summary:
            //      shows the popup content for the graphic on the mouse over event
            // mouseEvent - mouse over event
            console.log('app.MapController::showPopup', arguments);

            var graphic = mouseEvent.graphic;

            if (graphic === undefined) {
                return;
            }
        },
        buildContent: function() {
            // summary:
            //      build the popup content text based on the attribute values
            // attributes
            console.log('app.MapController::buildContent', arguments);
        },
        destroy: function() {
            // summary:
            //      destroys all handles
            console.log('app.MapControl::destroy', arguments);

            array.forEach(this.handles, function(handle) {
                handle.remove();
            });

            array.forEach(this.childWidgets, function(widget) {
                widget.destroy();
            }, this);
        }
    };
});