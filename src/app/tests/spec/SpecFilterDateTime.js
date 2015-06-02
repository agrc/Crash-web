require([
    'app/FilterDateTime',

    'dojo/dom-construct',
    'dojo/query'
], function (
    WidgetUnderTest,

    domConstruct,
    query
) {
    describe('app/FilterDateTime', function () {
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
            it('should create a FilterDateTime', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('Gather values', function () {
            it('gathers custom ranges', function () {
                widget.fromDateNode.value = '2015-01-01';
                widget.toDateNode.value = '2015-02-11';

                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    date: {
                        fromDate: '2015-01-01',
                        toDate: '2015-02-11'
                    }
                });
            });
            it('gathers days of the week', function () {
                query('[value=2]')[0].checked = true;
                query('[value=7]')[0].checked = true;

                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    date: {
                        specificDays: ['2', '7']
                    }
                });
            });
            it('gathers nothing with days are not selected', function () {
                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    date: {}
                });
            });
            it('gathers time of day', function () {
                widget.fromTimeNode.value = '00:00';
                widget.toTimeNode.value = '01:23';

                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    date: {
                        fromTime: '00:00',
                        toTime: '01:23'
                    }
                });
            });
            it('gathers everything from all!', function () {
                widget.fromDateNode.value = '2015-01-01';
                widget.toDateNode.value = '2015-02-11';
                widget.fromTimeNode.value = '00:00';
                widget.toTimeNode.value = '01:23';

                query('[value=2]')[0].checked = true;
                query('[value=7]')[0].checked = true;

                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    date: {
                        fromDate: '2015-01-01',
                        toDate: '2015-02-11',
                        fromTime: '00:00',
                        toTime: '01:23',
                        specificDays: ['2', '7']
                    }
                });
            });
        });
    });
});
