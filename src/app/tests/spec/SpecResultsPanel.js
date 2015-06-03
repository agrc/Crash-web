require([
    'app/ResultsPanel',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/ResultsPanel', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a ResultsPanel', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('Summary Report Label For Source Charts', function () {
            it('should return empty for filter with no date', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        a: {
                            b: '2013-01-23',
                            c: '2014-02-23'
                        }
                    }
                });

                expect(actual).toEqual('');
            });
            it('should format a single date', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            fromDate: '2013-01-23',
                            toDate: '2014-02-23'
                        }
                    }
                });

                expect(actual).toEqual('Wed, Jan 23, 2013 through Sun, Feb 23, 2014');
            });
            it('should format a single time', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            fromTime: '13:04',
                            toTime: '16:04'
                        }
                    }
                });

                expect(actual).toEqual('01:04 PM through 04:04 PM');
            });
            it('should format a single date and time', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            fromDate: '2013-01-23',
                            toDate: '2014-02-23',
                            fromTime: '13:04',
                            toTime: '16:04'
                        }
                    }
                });

                expect(actual).toEqual('Wed, Jan 23, 2013 01:04 PM through Sun, Feb 23, 2014 04:04 PM');
            });
            it('should return a generic label when no date and time are specified', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            days: [1, 2, 3]
                        }
                    }
                });

                expect(actual).toEqual('');
            });
        });

        describe('Summary Report Label For Compare Charts', function () {
            it('should format single dates', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            fromDate: '2013-01-23',
                            toDate: '2014-02-23'
                        }
                    },
                    compare: {
                        date: {
                            fromDate: '2013-02-23',
                            toDate: '2014-03-23'
                        }
                    }
                });

                expect(actual).toEqual('Comparing Wed, Jan 23, 2013 through Sun, Feb 23, 2014 ' +
                                       'and Sat, Feb 23, 2013 through Sun, Mar 23, 2014');
            });
            it('should format single times', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            fromTime: '13:04',
                            toTime: '16:04'
                        }
                    },
                    compare: {
                        date: {
                            fromTime: '04:04',
                            toTime: '15:04'
                        }
                    }
                });

                expect(actual).toEqual('Comparing 01:04 PM through 04:04 PM ' +
                                       'and 04:04 AM through 03:04 PM');
            });
            it('should format a single date and time', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            fromDate: '2013-01-23',
                            toDate: '2014-02-23',
                            fromTime: '13:04',
                            toTime: '16:04'
                        }
                    },
                    compare: {
                        date: {
                            fromDate: '2013-02-23',
                            toDate: '2014-03-23',
                            fromTime: '04:04',
                            toTime: '15:04'
                        }
                    }
                });

                expect(actual).toEqual('Comparing Wed, Jan 23, 2013 01:04 PM through Sun, Feb 23, 2014 04:04 PM ' +
                                       'and Sat, Feb 23, 2013 04:04 AM through Sun, Mar 23, 2014 03:04 PM');
            });
            it('should return a generic label when no date and time are specified', function () {
                var actual = widget.setFilterLabel({
                    source: {
                        date: {
                            days: [1, 2, 3]
                        }
                    },
                    compare: {
                        date: {
                            factors: [1, 2, 3]
                        }
                    }
                });

                expect(actual).toEqual('');
            });
        });
    });
});
