require([
    'app/FilterControls',

    'dojo/dom-construct',
    'dojo/Stateful'
], function(
    WidgetUnderTest,

    domConstruct,
    Stateful
) {
    describe('app/FilterControls', function() {
        var widget;

        var destroy = function(widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a FilterControls', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('Definition Query', function() {
            it('returns empty if no criteria', function() {
                var actual = widget._buildDefinitionQueryFromObject({});
                expect(actual).toEqual('');
            });
            describe('date and time criteria', function() {
                var today = new Date(2015, 0, 1, 0, 0, 0, 0); //  Thu Jan 01 2015 00:00:00 GMT-0700 (MST)
                var past = new Date(2014, 0, 2, 0, 0, 0, 0);
                it('formats predefined dates', function() {
                    var criteria = {
                        date: {
                            predefined: -7,
                            today: today // testing param
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('date >= \'2014-12-25\'');
                });
                it('formats custom ranges', function() {
                    var criteria = {
                        date: {
                            fromDate: past,
                            toDate: today
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('date BETWEEN \'2014-01-02\' AND \'2015-01-01\'');
                });
                it('is empty on partial custom date range', function() {
                    var criteria = {
                        date: {
                            fromDate: null,
                            toDate: today
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('');
                });
                it('formats days of the week', function() {
                    var criteria = {
                        date: {
                            specificDays: [1, 7]
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('day IN (1,7)');
                });
                it('formats time spans', function() {
                    var criteria = {
                        date: {
                            fromTime: '10:11',
                            toTime: '22:12'
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('CAST(date as TIME) BETWEEN \'10:11\' AND \'22:12\'');
                });
                it('is empty on partial custom time', function() {
                    var criteria = {
                        date: {
                            fromTime: '10:11',
                            toTime: null
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('');
                });
            });
            describe('combined criteria', function() {
                var today = new Date(2015, 0, 1, 0, 0, 0, 0); //  Thu Jan 01 2015 00:00:00 GMT-0700 (MST)
                var past = new Date(2014, 0, 2, 0, 0, 0, 0);
                it('formats custom range and day of week', function() {
                    var criteria = {
                        date: {
                            fromDate: past,
                            toDate: today,
                            specificDays: [1, 7]
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('date BETWEEN \'2014-01-02\' AND \'2015-01-01\' AND day IN (1,7)');
                });
                it('formats custom range and day of week and time', function() {
                    var criteria = {
                        date: {
                            fromDate: past,
                            toDate: today,
                            specificDays: [1, 2, 3, 4, 5],
                            fromTime: '12:00',
                            toTime: '13:00'
                        }
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('date BETWEEN \'2014-01-02\' AND \'2015-01-01\' AND ' +
                        'day IN (1,2,3,4,5) AND ' +
                        'CAST(date as TIME) BETWEEN \'12:00\' AND \'13:00\'');
                });
                it('formats custom range and day of week and time and crash factors', function() {
                    var criteria = {
                        date: {
                            fromDate: past,
                            toDate: today,
                            specificDays: [1, 2, 3, 4, 5],
                            fromTime: '12:00',
                            toTime: '13:00'
                        },
                        factors: ['dui', 'pedestrian']
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('crash_id IN (SELECT id FROM [rollup] WHERE dui=1 AND pedestrian=1) AND ' +
                        'date BETWEEN \'2014-01-02\' AND \'2015-01-01\' AND ' +
                        'day IN (1,2,3,4,5) AND ' +
                        'CAST(date as TIME) BETWEEN \'12:00\' AND \'13:00\'');
                });
            });
            describe('filter factor criteria', function () {
                it('formats single crash factors', function () {
                    var criteria = {
                        factors: ['dui']
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('crash_id IN (SELECT id FROM [rollup] WHERE dui=1)');
                });
                it('formats multiple crash factors', function () {
                    var criteria = {
                        factors: ['dui', 'pedestrian']
                    };

                    var actual = widget._buildDefinitionQueryFromObject(criteria);
                    expect(actual).toEqual('crash_id IN (SELECT id FROM [rollup] WHERE dui=1 AND pedestrian=1)');
                });
            });
        });

        describe('Data Gathering', function() {
            it('gathers data from its child widgets', function() {
                widget.childWidgets = [
                    new Stateful({
                        data: {
                            a: 1
                        }
                    }),
                    new Stateful({
                        data: {
                            b: 2
                        }
                    }),
                    new Stateful({
                        data: {
                            c: 3
                        }
                    })
                ];

                var actual = widget._getFilterCriteria();
                expect(actual).toEqual({
                        a: 1,
                        b: 2,
                        c: 3
                });
            });
        });
    });
});