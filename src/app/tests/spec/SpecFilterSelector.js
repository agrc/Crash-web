require([
    'app/FilterSelector',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/FilterSelector', function () {
        var widget;
        var appNode;

        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            appNode = domConstruct.place('<div id="app_center"></div>', document.body);
            widget = new WidgetUnderTest({
                FilterControls: function () {
                    return {};
                }
            },
            domConstruct.create('div', null, document.body));
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            if (appNode) {
                domConstruct.destroy(appNode);
            }
        });

        describe('Sanity', function () {
            it('should create a FilterSelector', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
