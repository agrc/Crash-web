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

        describe('Summary Report Label', function () {
            it('should contain the date and time parts', function () {
                widget.setCurrentSourceCriteria({
                    date: {
                        fromDate: '2013-01-23',
                        toDate: '2014-02-23'
                    }
                });
            });
        });
    });
});
