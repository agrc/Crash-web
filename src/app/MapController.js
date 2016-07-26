define([
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/layers/ClusterFeatureLayer',

    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/Color',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/graphic',
    'esri/graphicsUtils',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/symbols/SimpleLineSymbol',

    'layer-selector'
], function (
    BaseMap,

    config,
    ClusterFeatureLayer,

    domConstruct,
    on,
    query,
    topic,
    array,
    Color,
    lang,

    Extent,
    Graphic,
    graphicsUtils,
    DynamicLayer,
    TiledLayer,
    LineSymbol,

    BaseMapSelector
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

        // activeLayer: layer
        // summary:
        //      the active layer
        activeLayer: null,

        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function (params) {
            // summary:
            //      description
            console.log('app.MapController::init', arguments);

            lang.mixin(this, params);

            this.childWidgets = [];

            this.map = new BaseMap(this.mapDiv, {
                showAttribution: false,
                useDefaultBaseMap: false,
                sliderOrientation: 'horizontal'
            });

            new BaseMapSelector({
                map: this.map,
                id: 'tundra',
                quadWord: config.quadWord,
                baseLayers: ['Lite', 'Hybrid', 'Terrain', 'Topo', 'Color IR']
            });

            this.appendLogo('logo-alt');
            this.appendLogo('logo-alt2');

            this.symbol = new LineSymbol(LineSymbol.STYLE_SOLID, new Color('#F012BE'), 3);

            this.layers = [];

            this.subscriptions();
        },
        subscriptions: function () {
            // summary:
            //      subscribes to topics
            console.log('app.MapController::subscriptions', arguments);

            this.handles.push(
                topic.subscribe(config.topics.search.filter, lang.hitch(this, 'setQueryFilter')),
                topic.subscribe(config.topics.events.zoom, lang.hitch(this, 'zoom')),
                topic.subscribe(config.topics.events.fullExtent, lang.hitch(this, 'fullExtent'))
            );
        },
        startup: function () {
            // summary:
            //      startup once app is attached to dom
            console.log('app.MapController::startup', arguments);

            array.forEach(this.childWidgets, function (widget) {
                widget.startup();
            }, this);
        },
        setQueryFilter: function (filterCriteria) {
            // summary:
            //      formats and sets the query filter
            // filterCriteria
            console.log('app.MapController::setQueryFilter', arguments);

            this.activeLayer.setDefinitionExpression(filterCriteria);
        },
        addLayerAndMakeVisible: function (props) {
            // summary:
            //      description
            // props: object
            //  { url, serviceType, layerIndex, layerProps }
            console.log('app.MapController::addLayerAndMakeVisible', arguments);

            // check to see if layer has already been added to the map
            var lyr;
            var alreadyAdded = array.some(this.map.graphicsLayerIds, function (id) {
                console.log('app.MapController::addLayerAndMakeVisible||looping ids ', id);
                return id === props.id;
            }, this);

            console.log('app.MapController::addLayerAndMakeVisible||already added ', alreadyAdded);

            if (!alreadyAdded) {
                var LayerClass;

                switch (props.serviceType || 'dynamic') {
                    case 'clustered': {
                        LayerClass = ClusterFeatureLayer;
                        props.resolution = this.map.extent.getWidth() / this.map.width;
                        props.spatialReference = this.map.spatialReference;
                        break;
                    }
                    case 'tiled': {
                        LayerClass = TiledLayer;
                        break;
                    }
                    default: {
                        LayerClass = DynamicLayer;
                        break;
                    }
                }

                lyr = new LayerClass(props);

                this.map.addLayer(lyr);
                this.map.addLoaderToLayer(lyr);

                this.layers.push({
                    id: props.id,
                    layer: lyr
                });

                this.activeLayer = lyr;
            }
        },
        updateOpacity: function (opacity) {
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
        highlight: function (evt) {
            // summary:
            //      adds the clicked shape geometry to the graphics layer
            //      highlighting it
            // evt - mouse click event
            console.log('app.MapController::highlight', arguments);

            this.clearGraphic(this.graphic);

            this.graphic = new Graphic(evt.graphic.geometry, this.symbol);
            this.map.graphics.add(this.graphic);
        },
        clearGraphic: function (graphic) {
            // summary:
            //      removes the graphic from the map
            // graphic
            console.log('app.MapController::clearGraphic', arguments);

            if (graphic) {
                this.map.graphics.remove(graphic);
                this.graphic = null;
            }
        },
        zoom: function () {
            // summary:
            //      zoom to graphics
            //
            console.log('app.MapController::zoom', arguments);

            var self = this;
            on.once(this.activeLayer, 'update-end', function (args) {
                var extent;
                var graphics = args.target.graphics;

                if (Object.prototype.toString.call(graphics) === '[object Array]') {
                    if (graphics.length === 2) {
                        extent = self.activeLayer._getClusterExtent(graphics[0]);
                    } else {
                        extent = graphicsUtils.graphicsExtent(graphics);
                    }
                } else {
                    extent = self.activeLayer._getClusterExtent(graphics);
                    // extent = graphics.getExtent();
                }

                self.map.setExtent(extent, true);
            });
        },
        fullExtent: function () {
            // summary:
            //      zoom to the full extent
            console.log('app.MapController::fullExtent', arguments);

            var defaultExtent = new Extent({
                xmax: 696328,
                xmin: 207131,
                ymax: 4785283,
                ymin: 3962431,
                spatialReference: {
                    wkid: 26912
                }
            });

            if (defaultExtent.center) {
                this.map.setScale(defaultExtent.scale);
                return this.map.centerAt(defaultExtent.center);
            }
            return this.map.setExtent(defaultExtent);
        },
        showPopup: function (mouseEvent) {
            // summary:
            //      shows the popup content for the graphic on the mouse over event
            // mouseEvent - mouse over event
            console.log('app.MapController::showPopup', arguments);

            var graphic = mouseEvent.graphic;

            if (graphic === undefined) {
                return;
            }
        },
        buildContent: function () {
            // summary:
            //      build the popup content text based on the attribute values
            // attributes
            console.log('app.MapController::buildContent', arguments);
        },
        appendLogo: function (css) {
            // summary:
            //      adds css to map
            //
            console.log('app.MapController::appendLogo', arguments);

            var node = query('.esriControlsBR', this.map.domNode)[0];
            var logo = domConstruct.toDom('<div class="' + css + '"></div>');

            domConstruct.place(logo, node, 'first');
        },
        destroy: function () {
            // summary:
            //      destroys all handles
            console.log('app.MapControl::destroy', arguments);

            array.forEach(this.handles, function (handle) {
                handle.remove();
            });

            array.forEach(this.childWidgets, function (widget) {
                widget.destroy();
            }, this);
        }
    };
});
