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
                topic.subscribe(config.topics.map.drawing.activate, lang.hitch(this, 'activateDrawing')),
                topic.subscribe(config.topics.map.drawing.clear, lang.hitch(this, 'clearGraphic')),
                this.map.on('draw:created', lang.hitch(this, 'addGraphic'))
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

            if(filterCriteria.shape){
                this.activeLayer.query().within(filterCriteria.shape)
                    .where(filterCriteria.sql)
                    .run(function(e, f){
                        // update cluster layer
                        console.log(f);
                    });
            }
            this.activeLayer.setWhere(filterCriteria.sql);
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
        addGraphic: function(e) {
            // summary:
            //      adds graphics to a graphics layer
            // e: a polygon or shape style layer
            console.log('app.MapController::addGraphic', arguments);

            this.graphic = e.layer;

            this.map.addLayer(this.graphic);
            this.graphic.bringToFront();

            topic.publish(config.topics.map.graphic.add, this.graphic);
        },
        clearGraphic: function() {
            // summary:
            //      removes the graphic from the map
            console.log('app.MapController::clearGraphic', arguments);

            if(this.graphic){
                this.map.removeLayer(this.graphic);
                this.graphic = null;
            }
        },
        activateDrawing: function(type) {
            // summary:
            //      activates the drawing for the layer
            // type
            console.log('app.MapControl::activateDrawing', arguments);

            if(type === 'polygon'){
                new L.Draw.Polygon(this.map).enable();
                return;
            }
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
