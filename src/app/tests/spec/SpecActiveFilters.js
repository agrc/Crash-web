require([
    'app/ActiveFilters',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/ActiveFilters', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a ActiveFilters', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('_invokeProperties', function () {
            it('calls the keys as functions', function () {
                var source = {
                    factors: ['0', '1']
                };

                spyOn(widget, '_factors');

                widget._invokeProperties(source);

                expect(widget._factors.calls.count()).toEqual(1);
            });
            it('skips keys in the skipKeys array', function () {
                var source = {
                    factors: ['0', '1'],
                    severity: ['2', '3']
                };

                spyOn(widget, '_factors');
                widget._shape = function () {};
                spyOn(widget, '_shape');

                widget._invokeProperties(source);

                expect(widget._factors.calls.count()).toEqual(1);
                expect(widget._shape).not.toHaveBeenCalled();
            });
        });
        describe('_factors', function () {
            it('removes _ chars', function () {
                var source = {
                    factors: ['wild_animal', 'dui']
                };

                var result = widget._invokeProperties(source);

                expect(result.factors).toEqual('wild animal, dui');
            });
        });
        describe('_milepost', function () {
            it('formats for humans', function () {
                var source = {
                    milepost: {
                        route: 15,
                        to: 300,
                        from: 199
                    }
                };

                var result = widget._invokeProperties(source);

                expect(result.milepost).toEqual('Route 15 between milepost 199-300');
            });
        });
    });
});
