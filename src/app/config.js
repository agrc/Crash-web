define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/config'
], function (
    has,
    xhr,

    esriConfig
) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('storage.googleapis.com');
    esriConfig.defaults.io.corsEnabledServers.push('us-central1-ut-dts-agrc-crash-dev.cloudfunctions.net');

    var apiKey;
    var quadWord;
    var bucketName = 'ut-dts-agrc-crash-dev-data';

    if (has('agrc-build') === 'prod') {
        // crashmapping.utah.gov
        apiKey = 'AGRC-74CDA9DA213937';
        quadWord = 'nixon-flex-modest-stamp';
        bucketName = 'ut-dts-agrc-crash-prod-data';
    } else if (has('agrc-build') === 'stage') {
        // crashmapping.dev.utah.gov
        apiKey = 'AGRC-FE1B257E901672';
        quadWord = 'wedding-tactic-enrico-yes';
    } else {
        // localhost
        apiKey = 'AGRC-63E1FF17767822';
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            quadWord = secrets.quadWord;
            apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting quad word!';
        });
    }


    window.AGRC = {
        apiKey: apiKey,
        quadWord: quadWord,

        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.1.0',

        // minDate: String
        // summary:
        //      the oldest date of crashes in the system
        minDate: '',

        // maxDate: String
        // summary:
        //      the most current crash data in the system
        maxDate: '',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        urls: {
            service: 'https://mapserv.utah.gov/arcgis/rest/services/Crash/Crashes/MapServer/0',
            stats: 'https://us-central1-ut-dts-agrc-crash-dev.cloudfunctions.net/crash-stats-api/',
            points: 'https://storage.googleapis.com/' + bucketName + '/points.json',
            dates: 'https://storage.googleapis.com/' + bucketName + '/dates.json'
        },

        topics: {
            search: {
                filter: 'f',
                filterSource: 'fs',
                reset: 'r',
                gather: 'g'
            },
            charts: {
                display: 'c'
            },
            events: {
                hideComparisonFilter: 'h',
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

    xhr(window.AGRC.urls.dates, {
        handleAs: 'json',
        sync: true,
        headers: {
            'X-Requested-With': null
        }
    }).then(function (dates) {
        window.AGRC.minDate = dates.minDate;
        window.AGRC.maxDate = dates.maxDate;
    }, function () {
        throw 'Error getting dates!';
    });

    return window.AGRC;
});
