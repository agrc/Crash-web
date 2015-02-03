require([
    'app/FilterFactors',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/query'
], function(
    WidgetUnderTest,

    domClass,
    domConstruct,
    query
) {
    describe('app/FilterFactors', function() {
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
            it('should create a FilterFactors', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('presentation', function() {
            it('adds a css class when clicked on (checkbox checked)', function() {
                var node = query('input[type="checkbox"][value="pedestrian"]', widget.domNode)[0];
                widget.clicked({
                    target: node,
                    preventDefault: function(){},
                    stopPropagation: function(){},
                    cancelBubble: false
                });

                expect(domClass.contains(node.parentNode, 'btn-success')).toEqual(true);
            });
            it('removes a css class when clicked on (checkbox unchecked)', function() {
                var node = query('input[type="checkbox"][value="pedestrian"]', widget.domNode)[0];
                domClass.add(node.parentNode, 'btn-success');

                widget.clicked({
                    target: node,
                    preventDefault: function(){},
                    stopPropagation: function(){},
                    cancelBubble: false
                });

                expect(domClass.contains(node.parentNode, 'btn-success')).toEqual(false);
            });
        });
        describe('Gather values', function() {
            it('gathers single value', function() {
                query('input[type="checkbox"][value="pedestrian"]', widget.domNode)[0].checked = true;

                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    factors: ['pedestrian']
                });
            });
            it('gathers multiple values', function() {
                query('input[type="checkbox"][value="pedestrian"]', widget.domNode)[0].checked = true;
                query('input[type="checkbox"][value="dui"]', widget.domNode)[0].checked = true;

                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    factors: ['pedestrian', 'dui']
                });
            });
            it('gathers no values', function() {
                widget._gatherData();
                var actual = widget.get('data');
                expect(actual).toEqual({
                    factors: null
                });
            });
        });
    });
});