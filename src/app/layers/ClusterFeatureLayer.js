/* jshint maxcomplexity:false */
define([
    'dojo/_base/array',
    'dojo/_base/Color',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/aspect',
    'dojo/on',
    'dojo/request/xhr',

    'dojox/lang/functional/object',

    'esri/config',
    'esri/dijit/PopupTemplate',
    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/graphic',
    'esri/layers/GraphicsLayer',
    'esri/renderers/ClassBreaksRenderer',
    'esri/renderers/jsonUtils',
    'esri/request',
    'esri/SpatialReference',
    'esri/symbols/Font',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/TextSymbol',
    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'mustache/mustache'
], function (
    arrayUtils,
    Color,
    declare,
    evt,
    lang,
    aspect,
    on,
    xhr,

    object,

    esriConfig,
    PopupTemplate,
    Extent,
    Point,
    Graphic,
    GraphicsLayer,
    ClassBreaksRenderer,
    rendererJsonUtil,
    esriRequest,
    SpatialReference,
    Font,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    TextSymbol,
    Query,
    QueryTask,

    mustache
) {

    function concat(a1, a2) {
        return a1.concat(a2);
    }

    return declare([GraphicsLayer], {
        constructor: function (options) {
            console.log('app.ClusterFeatureLayer::constructor', arguments);
            // options:
            //     url:    string
            //        URL string. Required. Will generate clusters based on Features returned from map service.
            //     outFields:    Array?
            //        Optional. Defines what fields are returned with Features.
            //     objectIdField:    String?
            //        Optional. Defines the OBJECTID field of service. Default is 'OBJECTID'.
            //     where:    String?nn
            //        Optional. Where clause for query.
            //     useDefaultSymbol:    Boolean?
            //        Optional. Use the services default symbology for single features.
            //     returnLimit:    Number?
            //        Optional. Return limit of features returned from query. Default is 1000.
            //     distance:    Number?
            //         Optional. The max number of pixels between points to group points in the
            //                    same cluster. Default value is 50.
            //     labelColor:    String?
            //         Optional. Hex string or array of rgba values used as the color for cluster
            //                   labels. Default value is #fff (white).
            //     labelOffset:    String?
            //         Optional. Number of pixels to shift a cluster label vertically. Defaults
            //                      to -5 to align labels with circle symbols. Does not work in IE.
            //     resolution:    Number
            //         Required. Width of a pixel in map coordinates. Example of how to calculate:
            //         map.extent.getWidth() / map.width
            //     showSingles:    Boolean?
            //         Optional. Whether or graphics should be displayed when a cluster graphic is
            //                   clicked. Default is true.
            //     zoomOnClick:    Boolean?
            //         Optional. Will zoom the map when a cluster graphic is clicked. Default is true.
            //     singleSymbol:    MarkerSymbol?
            //         Marker Symbol (picture or simple). Optional. Symbol to use for graphics that
            //         represent single points. Default is a small gray SimpleMarkerSymbol.
            //     singleRenderer:    Renderer?
            //         Optional. Can provide a renderer for single features to override the default renderer.
            //     singleTemplate:    PopupTemplate?
            //         PopupTemplate</a>. Optional. Popup template used to format attributes for
            //          graphics that represent single points. Default shows all attributes as
            //          'attribute = value' (not recommended).
            //     maxSingles:    Number?
            //         Optional. Threshold for whether or not to show graphics for points in a cluster.
            //          Default is 1000.
            //     font:    TextSymbol?
            //         Optional. Font to use for TextSymbol. Default is 10pt, Arial.
            //     spatialReference:    SpatialReference?
            //         Optional. Spatial reference for all graphics in the layer. This has to match
            //                  the spatial reference of the map. Default is 102100. Omit this if
            //                  the map uses basemaps in web mercator.
            this._clusterTolerance = options.distance || 50;
            this._clusterData = [];
            this._clusters = [];
            this._clusterLabelColor = options.labelColor || '#000';
            // labelOffset can be zero so handle it differently
            this._clusterLabelOffset = (options.hasOwnProperty('labelOffset')) ? options.labelOffset : -5;
            // graphics that represent a single point
            this._singles = []; // populated when a graphic is clicked
            this._showSingles = options.hasOwnProperty('showSingles') ? options.showSingles : true;
            this._zoomOnClick = options.hasOwnProperty('zoomOnClick') ? options.zoomOnClick : true;
            // symbol for single graphics
            this._singleSym = options.singleSymbol || new SimpleMarkerSymbol('circle', 8,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 116, 217, 0.35]), 8),
                new Color([0, 116, 217, 0.75]));
            this._singleTemplate = options.singleTemplate || new PopupTemplate({
                'title': 'Injuries: {severity}',
                'description': '<label>Date</label>: {date}<br/>' +
                                '<label>Event</label>: {event}<br/>' +
                                '<label>Collision Type</label>: {collision_type}<br/>' +
                                '<label>Weather</label>: {weather_condition}<br/>' +
                                '<label>Road</label>: {road_name} was {road_condition}'
            });
            this._singleTemplateWithoutCollision = new PopupTemplate({
                'title': 'Injuries: {severity}',
                'description': '<label>Date</label>: {crash_date}<br/>' +
                                '<label>Event</label>: {event}<br/>' +
                                '<label>Weather</label>: {weather_condition}<br/>' +
                                '<label>Road</label>: {road_name} was {road_condition}'
            });
            this._maxSingles = options.maxSingles || 10000;

            this._font = options.font || new Font('10pt').setFamily('Arial');

            this._sr = options.spatialReference || new SpatialReference({
                'wkid': 102100
            });

            this._zoomEnd = null;

            this.url = options.url || null;
            this.points = options.points || null;
            this._outFields = options.outFields || ['*'];
            this.queryTask = new QueryTask(this.url);
            this._where = options.where || null;
            this._useDefaultSymbol = options.hasOwnProperty('useDefaultSymbol') ? options.useDefaultSymbol : false;
            this._returnLimit = options.returnLimit || 1000;
            this._singleRenderer = options.singleRenderer;

            this._objectIdField = options.objectIdField || 'OBJECTID';

            if (!this.url) {
                throw new Error('url is a required parameter');
            }
            this._clusterCache = {};
            this._objectIdCache = [];
            this._objectIdHash = {};

            // track current cluster and label
            this._currentClusterGraphic = null;
            this._currentClusterLabel = null;

            this._visitedExtent = null;

            this.detailsLoaded = false;

            this._query = new Query();
            this._identifyQuery = new Query();
            this._identifyQuery.outSpatialReference = this._sr;
            this._identifyQuery.returnGeometry = false;
            this._identifyQuery.outFields = this._outFields;

            this.identifyTemplate = '<label>Date</label>: {{crash_date}}<br/>' +
                '<label>Event</label>: {{event}}<br/>' +
                '{{#collision_type}}' +
                '<label>Collision Type</label>: {{collision_type}}<br/>' +
                '{{/collision_type}}' +
                '<label>Weather</label>: {{weather_condition}}<br/>' +
                '<label>Road</label>: {{road_name}} was {{road_condition}}';
            mustache.parse(this.identifyTemplate);

            this.MODE_SNAPSHOT = options.hasOwnProperty('MODE_SNAPSHOT') ? options.MODE_SNAPSHOT : true;

            this._getServiceDetails();

            aspect.before(this, '_getObjectIds', function () {
                this.emit('update-start', {});
            });
            aspect.after(this, '_showAllClusters', function () {
                this.emit('update-end', {});
            });

            esriConfig.defaults.geometryService = '/arcgis/rest/services/Utilities/Geometry/GeometryServer';
        },
        _getServiceDetails: function () {
            console.log('app.ClusterFeatureLayer::_getServiceDetails', arguments);

            esriRequest({
                url: this.url,
                content: {
                    f: 'json'
                },
                handleAs: 'json'
            }).then(lang.hitch(this, function (response) {
                this._defaultRenderer = this._singleRenderer ||
                    rendererJsonUtil.fromJson(response.drawingInfo.renderer);
                if (response.geometryType === 'esriGeometryPolygon') {
                    this._useDefaultSymbol = false;
                }
                this.emit('details-loaded', response);
            }));
        },
        _setMap: function (map) {
            console.log('app.ClusterFeatureLayer::_setMap', arguments);

            this._query.outSpatialReference = map.spatialReference;
            this._query.returnGeometry = false;
            this._query.outFields = ['objectid'];
            // listen to extent-change so data is re-clustered when zoom level changes
            this._extentChange = on(map, 'zoom-end, pan-end', lang.hitch(this, function () {
                this._reCluster();
                this.emit('update-end', {});
            }));
            this._extentChange = on(map, 'zoom-start, pan-start', lang.hitch(this, function () {
                this.emit('update-start', {});
            }));
            // listen for popup hide/show - hide clusters when pins are shown
            map.infoWindow.on('hide', lang.hitch(this, '_popupVisibilityChange'));
            map.infoWindow.on('show', lang.hitch(this, '_popupVisibilityChange'));
            map.on('click', lang.hitch(this, function () {
                map.infoWindow.hide();
            }));

            var layerAdded = on(map, 'layer-add', lang.hitch(this, function (e) {
                if (e.layer === this) {
                    layerAdded.remove();
                    if (!this.detailsLoaded) {
                        on.once(this, 'details-loaded', lang.hitch(this, function () {
                            if (!this.renderer) {
                                var renderer = new ClassBreaksRenderer(this._singleSym, 'clusterCount');

                                // Blue clusters
                                var small = new SimpleMarkerSymbol('circle', 25,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                        new Color([46, 204, 64, 0.35]), 10),
                                    new Color([46, 204, 64, 0.75]));
                                var medium = new SimpleMarkerSymbol('circle', 35,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                        new Color([255, 220, 0, 0.35]), 10),
                                    new Color([255, 220, 0, 0.75]));
                                var large = new SimpleMarkerSymbol('circle', 45,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                        new Color([255, 133, 27, 0.35]), 10),
                                    new Color([255, 133, 27, 0.75]));
                                var xlarge = new SimpleMarkerSymbol('circle', 50,
                                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                                        new Color([255, 65, 54, 0.35]), 10),
                                    new Color([255, 65, 54, 0.75]));

                                renderer.addBreak(2, 100, small);
                                renderer.addBreak(100, 500, medium);
                                renderer.addBreak(500, 2500, large);
                                renderer.addBreak(2500, Infinity, xlarge);
                                this.setRenderer(renderer);
                            }
                            // this._reCluster();
                            this._getObjectIds();
                        }));
                    }
                }
            }));

            // GraphicsLayer will add its own listener here
            var div = this.inherited(arguments);
            return div;
        },
        _unsetMap: function () {
            console.log('app.ClusterFeatureLayer::_unsetMap', arguments);

            this.inherited(arguments);
            this._extentChange.remove();
        },
        _reCluster: function () {
            // Recluster when extent changes
            console.log('app.ClusterFeatureLayer::_reCluster', arguments);


            // // update resolution
            this._clusterResolution = this._map.extent.getWidth() / this._map.width;
            // // Smarter cluster, only query when we have to
            // // Fist time
            // if (!this._visitedExtent) {
            //     this._getObjectIds();
            //     // New extent
            // } else if (!this._visitedExtent.contains(this._map.extent)) {
            // this._getObjectIds();
            //     // Been there, but is this a pan or zoom level change?
            // } else {
            this._clusterGraphics();
            // }
            // // update clustered extent
            // this._visitedExtent = this._visitedExtent ?
            // this._visitedExtent.union(this._map.extent) : this._map.extent;
        },
        _getObjectIds: function (where) {
            // Get the features by IDs
            console.log('app.ClusterFeatureLayer::_getObjectIds', arguments);

            if (!this.url) {
                return;
            }

            if (where) {
                this._query.where = where;
                this.queryTask.executeForIds(this._query).then(
                    lang.hitch(this, '_onIdFiltering'), lang.hitch(this, '_onError'));

                return;
            }

            // don't fetch points when resetting
            if (!this._pointCache || this._pointCache.length < 1) {
                xhr.get(this.points, {
                    handleAs: 'json'
                }).then(lang.hitch(this, '_onIdsReturned'), lang.hitch(this, '_onError'));

                return;
            }

            this._onFeaturesReturned({
                features: this._getPoints(this._pointCache)
            });
        },
        _onIdsReturned: function (results) {
            console.log('app.ClusterFeatureLayer::_onIdsReturned', arguments);

            if (!this._pointCache || this._pointCache.length < 1) {
                this._pointCache = {};
                var l = results.points.length;
                for (var i = l - 1; i >= 0; i--) {
                    this._pointCache[results.points[i][0]] = {
                        x: results.points[i][1],
                        y: results.points[i][2],
                        id: results.points[i][0],
                        attributes: {}
                    };
                }
            }

            this._objectIdCache = this._getIds(this._pointCache);
            this._onFeaturesReturned({
                features: this._getPoints(this._pointCache)
            });
            // var uncached = difference(results, this._objectIdCache.length, this._objectIdHash);
            // this._objectIdCache = concat(this._objectIdCache, uncached);
            // if (uncached && uncached.length) {
            //     this._query.where = null;
            //     this._query.geometry = null;
            //     var queries = [];
            //     if (uncached.length > this._returnLimit) {
            //         while (uncached.length) {
            //             // Improve performance by just passing list of IDs
            //             this._query.objectIds = uncached.splice(0, this._returnLimit - 1);
            //             queries.push(this.queryTask.execute(this._query));
            //         }
            //         all(queries).then(lang.hitch(this, function(res) {
            //             var features = arrayUtils.map(res, function(r) {
            //                 return r.features;
            //             });
            //             this._onFeaturesReturned({
            //                 features: merge(features)
            //             });
            //         }));
            //     } else {
            //         // Improve performance by just passing list of IDs
            //         this._query.objectIds = uncached.splice(0, this._returnLimit - 1);
            //         this.queryTask.execute(this._query).then(
            //             lang.hitch(this, '_onFeaturesReturned'), lang.hitch(this, '_onError);
            //         );
            //     }
            // } else if (this._objectIdCache.length) {
            //     this._onFeaturesReturned({ // kinda hacky here
            //         features: []
            //     });
            //     //this._clusterGraphics();
            // } else {
            //     this.clear();
            // }
        },
        _getIds: function (points) {
            // summary:
            //      gets the [[id,x,y]]
            // points
            console.log('app.ClusterFeatureLayer::_getIds', arguments);

            return object.keys(points);
        },
        _getPoints: function (points) {
            console.log('app.ClusterFeatureLayer::_getPoints', arguments);

            return object.values(points);
        },
        _onFeaturesReturned: function (results) {
            // Add features to cluster cache and refine cluster data to draw - clears all graphics!
            console.log('app.ClusterFeatureLayer::_onFeaturesReturned', arguments);

            this._clusterResolution = this._map.extent.getWidth() / this._map.width;
            var inExtent = this._inExtent();
            var features;
            features = results.features;
            var len = features.length;
            this._clusterData.length = 0;

            // Update the cluster features for drawing
            if (len) {
                //this._clusterData.lenght = 0;  // Bug
                this._clusterData.length = 0;
                // Append actual feature to oid cache
                arrayUtils.forEach(features, function (feat) {
                    if (feat) {
                        this._clusterCache[feat.id] = feat;
                    }
                    // this._clusterCache[feat.attributes[this._objectIdField]] = feat;
                }, this);
                // Refine features to draw
                this._clusterData = concat(features, inExtent);
            }
            //this._clusterData = concat(features, inExtent);

            // debug
            // var end = new Date().valueOf();
            //

            // Cluster the features
            this._clusterGraphics();
        },
        _clusterGraphics: function () {
            // Build new cluster array from features and draw graphics
            console.log('app.ClusterFeatureLayer::_clusterGraphics', arguments);

            // TOD - should test if this is a pan or zoom level change before reclustering

            // Remove all existing graphics from layer
            this.clear();

            // first time through, loop through the points
            for (var j = 0, jl = this._clusterData.length; j < jl; j++) {
                // see if the current feature should be added to a cluster
                var point = this._clusterData[j].geometry ||
                    new Point(this._clusterData[j].x, this._clusterData[j].y, this._map.spatialReference);
                // TEST - Only cluster what's in the current extent.  TOD - better way to do this?
                if (!this._map.extent.contains(point)) {
                    // Reset all other clusters and make sure their id is changed
                    this._clusterData[j].attributes.clusterId = -1;
                    continue;
                }
                var feature = this._clusterData[j];
                var clustered = false;
                // Add point to existing cluster
                for (var i = 0; i < this._clusters.length; i++) {
                    var c = this._clusters[i];
                    if (this._clusterTest(point, c)) {
                        this._clusterAddPoint(feature, point, c);
                        clustered = true;
                        // TOD- try to update center of cluster - poor results, should use a grid system
                        // var pts = new Multipoint(this._map.spatialReference);
                        // pts.addPoint(new Point(c.x, c.y));
                        // pts.addPoint(point);
                        // var center = pts.getExtent().getCenter();
                        // c.x = center.x;
                        // c.y = center.y;
                        break;
                    }
                }
                // Or create a new cluster (of one)
                if (!clustered) {
                    this._clusterCreate(feature, point);
                }
            }

            this._showAllClusters();
        },


        onClick: function (e) {
            console.log('app.ClusterFeatureLayer::onClick', arguments);
            // Don't bubble click event to map
            evt.stop(e);

            var singles = null;
            var loadingContent = '<div style="width:100%;height:25px"' +
                    'aria-valuenow="1" aria-valuemin="0" aria-valuemax="1"' +
                    'class="progress-bar progress-bar-striped active"></div>';

            // Single cluster click - only good until re-cluster!
            if (e.graphic.attributes.clusterCount === 1) {
                this._showClickedCluster(true);
                // Unset cluster graphics
                this._setClickedClusterGraphics(null);
                // Remove graphics from layer
                this.clearSingles(this._singles);
                singles = this._getClusterSingles(e.graphic.attributes.clusterId);
                // arrayUtils.forEach(singles, function(g) {
                //     g.setSymbol(this._getDefaultSymbol(g));
                //     g.setInfoTemplate(this._singleTemplate);
                // }, this);

                // Add graphic to layer
                // this._addSingleGraphics(singles);
                // this._map.infoWindow.setFeatures(singles);


                this._identify(singles);
                this._map.infoWindow.setContent(loadingContent);
                this._map.infoWindow.show(e.graphic.geometry);
            } else if (this._zoomOnClick && e.graphic.attributes.clusterCount > 1 &&
            // Multi-cluster click, super zoom to cluster
                this._map.getZoom() !== this._map.getMaxZoom()) {
                // Zoom to level that shows all points in cluster, not necessarily the extent
                var extent = this._getClusterExtent(e.graphic);
                if (extent.getWidth()) {
                    this._map.setExtent(extent.expand(1.5), true);
                } else {
                    this._map.centerAndZoom(e.graphic.geometry, this._map.getMaxZoom());
                }
                // Multi-cluster click, show popup by finding actual singles and assigning to infoWindow
            } else {
                // Remove graphics from layer
                this.clearSingles(this._singles);
                // find single graphics that make up the cluster that was clicked
                // would be nice to use filter but performance tanks with large arrays in IE
                singles = this._getClusterSingles(e.graphic.attributes.clusterId);
                if (singles.length > this._maxSingles) {
                    alert('Sorry, that cluster contains more than ' + this._maxSingles +
                        ' points. Zoom in for more detail.');
                    return;
                } else {
                    // Save and hide the clustered graphics
                    this._showClickedCluster(true);
                    this._setClickedClusterGraphics(e.graphic);
                    this._showClickedCluster(false);
                    // Add graphics to layer
                    var g = this._addSingleGraphics(singles);



                    // var identifyPromise = new Deferred(this._identify(singles));

                    this._map.infoWindow.setContent(loadingContent);
                    this._map.infoWindow.show(g.geometry);

                    // identifyPromise = arrayUtils.map(singles, lang.hitch(this, function(p){
                    // return new Deferred(this._identify(p));
                    // }));

                    this._identify(singles);
                    // deferred.resolve();
                    // this._map.infoWindow.setFeatures([deferred]);
                    // this._identify(singles);
                    // this._map.infoWindow.show(e.graphic.geometry);
                }
            }
        },
        _showClickedCluster: function (show) {
            // Show or hide the currently selected cluster
            console.log('app.ClusterFeatureLayer::_showClickedCluster', arguments);

            if (this._currentClusterGraphic && this._currentClusterLabel) {
                if (show) {
                    this._currentClusterGraphic.show();
                    this._currentClusterLabel.show();
                } else {
                    this._currentClusterGraphic.hide();
                    this._currentClusterLabel.hide();
                }
            }
        },
        _identify: function (points) {
            // summary:
            //      description
            // params
            console.log('app.ClusterFeatureLayer::_identify', arguments);

            this._identifyQuery.objectIds = arrayUtils.map(points, function (p) {
                return p.id;
            });

            if (points.length === 1) {
                this.queryTask.execute(this._identifyQuery, lang.hitch(this, function (result) {
                    result.features[0].attributes.crash_date = new Date(result.features[0].attributes.crash_date).toLocaleString();
                    var content = mustache.render(this.identifyTemplate, result.features[0].attributes);
                    this._map.infoWindow.setTitle('Injuries: ' + result.features[0].attributes.severity);
                    this._map.infoWindow.setContent(content);
                }));

                return;
            }

            this._identifyQuery.returnGeometry = true;
            this.queryTask.execute(this._identifyQuery, lang.hitch(this, function (featureSet) {
                arrayUtils.forEach(featureSet.features, function (feature) {
                    feature.attributes.date = new Date(feature.attributes.date).toLocaleString();

                    /* jshint -W106 */
                    if (!feature.attributes.collision_type) {
                        /* jshint +W106 */
                        feature.infoTemplate = this._singleTemplateWithoutCollision;
                        return;
                    }

                    feature.infoTemplate = this._singleTemplate;
                }, this);

                this._map.infoWindow.setFeatures(featureSet.features);
                this._identifyQuery.returnGeometry = false;
            }));


            // var def = new Deferred();
            // def.then(this.queryTask.execute(this._identifyQuery).then(function(featureSet) {
            //     def.resolve(featureSet.features);
            // }));

            // return def;
        },



        _getDefaultSymbol: function (g) {
            console.log('app.ClusterFeatureLayer::_getDefaultSymbol', arguments);

            var rend = this._defaultRenderer;
            if (!this._useDefaultSymbol || !rend) {
                return this._singleSym;
            } else {
                return rend.getSymbol(g);
            }
        },
        _getRenderedSymbol: function (feature) {
            console.log('app.ClusterFeatureLayer::_getRenderedSymbol', arguments);

            var attr = feature.attributes;
            if (attr.clusterCount === 1) {
                if (!this._useDefaultSymbol) {
                    return this._singleSym;
                }
                var rend = this._defaultRenderer;
                if (!rend) { // something went wrong getting default renderer
                    return null;
                } else {
                    return rend.getSymbol(feature);
                }
            } else {
                return null;
            }
        },
        // Function to set the current cluster graphic (lable and cluster) that was clicked.
        _setClickedClusterGraphics: function (g) {
            console.log('app.ClusterFeatureLayer::_setClickedClusterGraphics', arguments);

            // Reset
            if (g === null) {
                this._currentClusterGraphic = null;
                this._currentClusterLabel = null;
                return;
            }
            // Cluster was clicked (symbol is null because it's set by renderer)
            if (g.symbol === null) {
                this._currentClusterLabel = this._getCurrentLabelGraphic(g);
                this._currentClusterGraphic = g;
                // Text symbol was clicked
            } else if (g.symbol.declaredClass === 'esri.symbol.TextSymbol') {
                this._currentClusterLabel = g;
                this._currentClusterGraphic = this._getCurrentClusterGraphic(g);
            }
            // Single in a cluster was clicked
            // } else {
            //     this._currentClusterGraphic = null;
            //     this._getCurrentLabelGraphic = null;
            // }
        },
        // Find the actual cluster graphic in the graphics layer
        _getCurrentClusterGraphic: function (c) {
            console.log('app.ClusterFeatureLayer::_getCurrentClusterGraphic', arguments);

            var gArray = arrayUtils.filter(this.graphics, function (g) {
                return (g.attributes.clusterId === c.attributes.clusterId);
            });
            return gArray[0];
        },
        // Find the actual cluster graphic label in the graphics layer
        _getCurrentLabelGraphic: function (c) {
            var gArray = arrayUtils.filter(this.graphics, function (g) {
                return (g.symbol &&
                    g.symbol.declaredClass === 'esri.symbol.TextSymbol' &&
                    g.attributes.clusterId === c.attributes.clusterId);
            });
            return gArray[0];
        },
        // When the popup appears, toggle the cluster to singles or the singles to a cluster
        _popupVisibilityChange: function () {
            console.log('app.ClusterFeatureLayer::_popupVisibilityChange', arguments);

            var show = this._map.infoWindow.isShowing;
            // Popup hidden, show cluster
            this._showClickedCluster(!show);
            this._map.infoWindow.clearFeatures();
            // Remove singles from layer
            if (!show) {
                //if (this._currentClusterGraphic && this._currentClusterLabel) {
                this.clearSingles();
                //}
            }
        },

        // override esri/layers/GraphicsLayer methods

        _onClusterClick: function (e) {
            console.log('app.ClusterFeatureLayer::_onClusterClick', arguments);

            var attr = e.graphic.attributes;
            if (attr && attr.clusterCount) {
                // Find points (data) in cluster
                var source = arrayUtils.filter(this._clusterData, function (g) {
                    return attr.clusterId === g.attributes.clusterId;
                }, this);
                this.emit('cluster-click', source);
            }
        },

        _onError: function (err) {
            console.error(err);
            this.emit('update-end', {});
        },

        _onIdFiltering: function (results) {
            // summary:
            //      when we get the ids from a query
            // results
            console.log('app.ClusterFeatureLayer::_onIdFiltering', arguments);

            var points = [];

            arrayUtils.forEach(results, function (id) {
                if (this._pointCache[id]) {
                    points.push(this._pointCache[id]);
                }
            }, this);

            this._onFeaturesReturned({
                features: points
            });
        },

        setDefinitionExpression: function (where) {
            // summary:
            //      description
            // where
            console.log('app.ClusterFeatureLayer::setDefinitionExpression', arguments);

            this._getObjectIds(where.sql);
        },
        // Return a cache of features in the current extent
        _inExtent: function () {
            console.log('app.ClusterFeatureLayer::_inExtent', arguments);

            var ext = this._map.extent;
            var len = this._objectIdCache.length;
            var valid = [];

            // See if cached feature is in current extent
            while (len--) {
                var oid = this._objectIdCache[len];
                var cached = this._clusterCache[oid];
                if (cached && ext.contains(cached.geometry)) {
                    valid.push(cached);
                }
            }

            return valid;
        },

        // public ClusterLayer methods
        updateClusters: function () {
            console.log('app.ClusterFeatureLayer::updateClusters', arguments);

            this.clearCache();
            this._reCluster();
        },
        clearCache: function () {
            console.log('app.ClusterFeatureLayer::clearCache', arguments);

            // Summary: Clears the cache for clustered items
            arrayUtils.forEach(this._objectIdCache, function (oid) {
                delete this._objectIdCache[oid];
            }, this);
            this._objectIdCache.length = 0;
            this._clusterCache = {};
            this._objectIdHash = {};
        },
        add: function (p) {
            // Summary:    The argument is a data point to be added to an existing cluster.
            //             If the data point falls within an existing cluster, it is added to
            //             that cluster and the cluster's label is updated. If the new point
            //             does not fall within an existing cluster, a new cluster is created.
            //
            // if passed a graphic, use the GraphicsLayer's add method
            if (p.declaredClass) {
                this.inherited(arguments);
                return;
            }

            // add the new data to _clusterData so that it's included in clusters when the map level changes
            this._clusterData.push(p);
            var clustered = false;
            // look for an existing cluster for the new point
            for (var i = 0; i < this._clusters.length; i++) {
                var c = this._clusters[i];
                if (this._clusterTest(p, c)) {
                    // add the point to an existing cluster
                    this._clusterAddPoint(p, c);
                    // update the cluster's geometry
                    this._updateClusterGeometry(c);
                    // update the label
                    this._updateLabel(c);
                    clustered = true;
                    break;
                }
            }

            if (!clustered) {
                this._clusterCreate(p);
                p.attributes.clusterCount = 1;
                this._showCluster(p);
            }
        },
        clear: function () {
            // Summary:    Remove all clusters and data points.
            this.inherited(arguments);
            this._clusters.length = 0;
        },
        clearSingles: function (singles) {
            // Summary:    Remove graphics that represent individual data points.
            var s = singles || this._singles;
            arrayUtils.forEach(s, function (g) {
                this.remove(g);
            }, this);
            this._singles.length = 0;
        },


        // Internal graphic methods


        // See if point is within the tolerance (pixels) of current cluster
        _clusterTest: function (p, cluster) {
            var distance = (
                Math.sqrt(
                    Math.pow((cluster.x - p.x), 2) + Math.pow((cluster.y - p.y), 2)
                ) / this._clusterResolution);

            return (distance <= this._clusterTolerance);
        },
        // points passed to clusterAddPoint should be included
        // in an existing cluster
        // also give the point an attribute called clusterId
        // that corresponds to its cluster
        _clusterAddPoint: function (feature, p, cluster) {
            // Average in the new point to the cluster geometry
            var count;
            var x;
            var y;
            count = cluster.attributes.clusterCount;
            x = (p.x + (cluster.x * count)) / (count + 1);
            y = (p.y + (cluster.y * count)) / (count + 1);
            cluster.x = x;
            cluster.y = y;

            // Build an extent that includes all points in a cluster
            if (p.x < cluster.attributes.extent[0]) {
                cluster.attributes.extent[0] = p.x;
            } else if (p.x > cluster.attributes.extent[2]) {
                cluster.attributes.extent[2] = p.x;
            }
            if (p.y < cluster.attributes.extent[1]) {
                cluster.attributes.extent[1] = p.y;
            } else if (p.y > cluster.attributes.extent[3]) {
                cluster.attributes.extent[3] = p.y;
            }

            // Increment the count
            cluster.attributes.clusterCount++;
            // attributes might not exist
            if (!p.hasOwnProperty('attributes')) {
                p.attributes = {};
            }

            if (!feature.hasOwnProperty('attributes')) {
                feature.attributes = {};
            }
            // give the graphic a cluster id
            feature.attributes.clusterId = p.attributes.clusterId = cluster.attributes.clusterId;
        },
        // Point isn't within the clustering distance specified for the layer so create a new cluster for it
        _clusterCreate: function (feature, p) {
            var clusterId = this._clusters.length + 1;
            // p.attributes might be undefined
            if (!p.attributes) {
                p.attributes = {};
            }
            if (!feature.attributes) {
                feature.attributes = {};
            }
            feature.attributes.clusterId = p.attributes.clusterId = clusterId;
            // create the cluster
            var cluster = {
                'x': p.x,
                'y': p.y,
                'attributes': {
                    'clusterCount': 1,
                    'clusterId': clusterId,
                    'extent': [p.x, p.y, p.x, p.y]
                }
            };
            this._clusters.push(cluster);
        },
        // Add all graphics to layer and fire 'clusters-shown' event
        _showAllClusters: function () {
            // debug
            // var start = new Date().valueOf();
            //

            for (var i = 0, il = this._clusters.length; i < il; i++) {
                this._showCluster(this._clusters[i]);
            }
            this.emit('clusters-shown', this._clusters);
            // this.emit('update-end');
            // debug
            // var end = new Date().valueOf();
            //
        },
        // Add graphic and to layer
        _showCluster: function (c) {
            var point = new Point(c.x, c.y, this._sr);

            var g = new Graphic(point, null, c.attributes);
            g.setSymbol(this._getRenderedSymbol(g));
            this.add(g);

            // code below is used to not label clusters with a single point
            if (c.attributes.clusterCount < 2) {
                return;
            }

            // show number of points in the cluster
            var label = new TextSymbol(c.attributes.clusterCount)
                .setColor(new Color(this._clusterLabelColor))
                .setOffset(0, this._clusterLabelOffset)
                .setFont(this._font);
            this.add(
                new Graphic(
                    point,
                    label,
                    c.attributes
                )
            );
        },
        // Internal utility functions
        _findCluster: function (c) {
            arrayUtils.filter(this.graphics, function (g) {
                return !g.symbol &&
                    g.attributes.clusterId === c.attributes.clusterId;
            });
        },
        _getClusterExtent: function (cluster) {
            var ext;
            ext = cluster.attributes.extent;
            return new Extent(ext[0], ext[1], ext[2], ext[3], this._map.spatialReference);
        },
        _getClusteredExtent: function () {
            var extent;
            var clusteredExtent;
            for (var i = 0; i < this._clusters.length; i++) {
                extent = this._getClusteredExtent(this._clusters[i]);
                if (!clusteredExtent) {
                    clusteredExtent = extent;
                } else {
                    clusteredExtent = clusteredExtent.union(extent);
                }
            }
            return clusteredExtent;
        },
        // Return all singles for a given cluster id
        _getClusterSingles: function (id) {
            // debug
            // var start = new Date().valueOf();
            //

            var singles = [];
            for (var i = 0, il = this._clusterData.length; i < il; i++) {
                if (id === this._clusterData[i].attributes.clusterId) {
                    singles.push(this._clusterData[i]);
                }
            }

            // debug
            // var end = new Date().valueOf();
            //

            return singles;
        },
        _addSingleGraphics: function (singles) {
            // add single graphics to the cluster layer
            var aGraphic = null;
            arrayUtils.forEach(singles, function (g) {
                g.attributes.clusterCount = 1;
                g = new Graphic(new Point(g.x, g.y, this._sr),
                                this._singleSym,
                                g.attributes);
                if (!aGraphic) {
                    aGraphic = g;
                }
                // g.setSymbol(this._getDefaultSymbol(g));
                // g.setInfoTemplate(this._singleTemplate);
                this._singles.push(g);
                // Add to layer
                if (this._showSingles) {
                    this.add(g);
                }
            }, this);

            return aGraphic;
            //this._map.infoWindow.setFeatures(this._singles);
        },
        _updateClusterGeometry: function (c) {
            // find the cluster graphic
            var cg = arrayUtils.filter(this.graphics, function (g) {
                return !g.symbol &&
                    g.attributes.clusterId === c.attributes.clusterId;
            });
            if (cg.length === 1) {
                cg[0].geometry.update(c.x, c.y);
            }
        },
        _updateLabel: function (c) {
            // find the existing label
            var label = arrayUtils.filter(this.graphics, function (g) {
                return g.symbol &&
                    g.symbol.declaredClass === 'esri.symbol.TextSymbol' &&
                    g.attributes.clusterId === c.attributes.clusterId;
            });
            if (label.length === 1) {
                //
                this.remove(label[0]);
                var newLabel = new TextSymbol(c.attributes.clusterCount)
                    .setColor(new Color(this._clusterLabelColor))
                    .setOffset(0, this._clusterLabelOffset)
                    .setFont(this._font);
                this.add(
                    new Graphic(
                        new Point(c.x, c.y, this._sr),
                        newLabel,
                        c.attributes)
                );
            }
        },
        // debug only...never called by the layer
        _clusterMeta: function () {
            // print total number of features


            // add up counts and print it
            var count = 0;
            arrayUtils.forEach(this._clusters, function (c) {
                count += c.attributes.clusterCount;
            });

        }
    });
});
