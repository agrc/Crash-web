/* jshint maxlen:false */
define(['dojo/has', 'esri/config'], function (has, esriConfig) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('basemaps.utah.gov');

    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '0.15.5',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        urls: {
            service: '/arcgis/rest/services/Crash/Crashes/FeatureServer/0',
            stats: location.pathname.replace(/\/(src|dist)/, '') + 'api/stats'
        },

        topics: {
            search: {
                filter: 'f',
                reset: 'r',
                gather: 'g'
            },
            events: {
                title: {
                    selected: 's'
                },
                zoom: 'z',
                fullExtent: 'e'
            }
        },

        counties: [
            ['Beaver', 1],
            ['Box Elder', 3],
            ['Cache', 5],
            ['Carbon', 7],
            ['Daggett', 9],
            ['Davis', 11],
            ['Duchesne', 13],
            ['Emery', 15],
            ['Garfield', 17],
            ['Grand', 19],
            ['Iron', 21],
            ['Juab', 23],
            ['Kane', 25],
            ['Millard', 27],
            ['Morgan', 29],
            ['Piute', 31],
            ['Rich', 33],
            ['Salt Lake', 35],
            ['San Juan', 37],
            ['Sanpete', 39],
            ['Sevier', 41],
            ['Summit', 43],
            ['Tooele', 45],
            ['Uintah', 47],
            ['Utah', 49],
            ['Wasatch', 51],
            ['Washington', 53],
            ['Wayne', 55],
            ['Weber', 57]
        ]
    };

    if (has('agrc-build') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
    }

    return window.AGRC;
});
