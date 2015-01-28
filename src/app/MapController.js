define([
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/Color',

    'esri/graphic',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/FeatureLayer',

    'esri/renderers/HeatmapRenderer',

    'esri/symbols/SimpleLineSymbol',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/map/BaseMapSelector'
], function(
    lang,
    array,
    Color,

    Graphic,

    DynamicLayer,
    TiledLayer,
    FeatureLayer,

    HeatmapRenderer,

    LineSymbol,

    BaseMap,
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

        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function(params) {
            // summary:
            //      description
            console.log('app.MapController::init', arguments);

            lang.mixin(this, params);

            this.childWidgets = [];

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false,
                defaultBaseMap: 'Lite'
            });

            this.symbol = new LineSymbol(LineSymbol.STYLE_SOLID, new Color('#F012BE'), 3);

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    id: 'claro',
                    position: 'TR',
                    defaultThemeLabel: 'Lite'
                }));

            this.layers = [];

            this.setUpSubscribes();
        },
        setUpSubscribes: function() {
            // summary:
            //      subscribes to topics
            console.log('app.MapController::setUpSubscribes', arguments);

            this.handles.push();
        },
        addLayerAndMakeVisible: function(props) {
            // summary:
            //      description
            // props: object
            //  { url, serviceType, layerIndex, layerProps }
            console.log('app.MapController::addLayerAndMakeVisible', arguments);

            // check to see if layer has already been added to the map
            var lyr;
            var alreadyAdded = array.some(this.map.graphicsLayerIds, function(id) {
                console.log('app.MapController::addLayerAndMakeVisible||looping ids ', id);
                return id === props.id;
            }, this);

            console.log('app.MapController::addLayerAndMakeVisible||already added ', alreadyAdded);

            if (!alreadyAdded) {
                var LayerClass, Renderer;

                switch (props.serviceType || 'dynamic') {
                    case 'feature':
                        {
                            LayerClass = FeatureLayer;
                            Renderer = new HeatmapRenderer({
                                colors: [
                                    'rgba(0,0,0,0)',
                                    'rgba(0,116,217,1)',
                                    'rgba(255,220,0,1)',
                                    'rgba(255,133,27,1)',
                                    'rgba(255,133,27,1)',
                                    'rgba(255,65,54,1)'
                                ],
                                blurRadius: 8
                            });
                            break;
                        }
                    case 'tiled':
                        {
                            LayerClass = TiledLayer;
                            break;
                        }
                    default:
                        {
                            LayerClass = DynamicLayer;
                            break;
                        }
                }

                lyr = new LayerClass(props.url, props);
                lyr.setRenderer(Renderer);

                this.map.addLayer(lyr);
                this.map.addLoaderToLayer(lyr);

                this.layers.push({
                    id: props.id,
                    layer: lyr
                });
            }
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
        startup: function() {
            // summary:
            //      startup once app is attached to dom
            console.log('app.MapController::startup', arguments);

            array.forEach(this.childWidgets, function(widget) {
                widget.startup();
            }, this);
        },
        highlight: function(evt) {
            // summary:
            //      adds the clicked shape geometry to the graphics layer
            //      highlighting it
            // evt - mouse click event
            console.log('app.MapController::highlight', arguments);

            this.clearGraphic(this.graphic);

            this.graphic = new Graphic(evt.graphic.geometry, this.symbol);
            this.map.graphics.add(this.graphic);
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