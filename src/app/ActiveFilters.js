define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/templates/ActiveFilters.html',
    'dojo/text!app/templates/activeFilterTemplate.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'mustache/mustache',

    'xstyle/css!app/resources/ActiveFilters.css'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    template,
    activeFilterTemplate,
    declare,
    lang,

    mustache
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The list of filters applied in human form
        templateString: template,
        baseClass: 'active-filters',

        skipKeys: ['shape', 'sql'],

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.ActiveFilters::postCreate', arguments);

            this.inherited(arguments);

            this.watch('source', this.updateDom);
            this.watch('compare', this.updateDom);

            mustache.parse(activeFilterTemplate);
        },
        updateDom: function (name, old, current) {
            // summary:
            //      update dom elements
            // changes
            console.log('app.ActiveFilters:updateDom', arguments);

            if (window.JSON.stringify(old) === window.JSON.stringify(current)) {
                return;
            }

            var obj = this.get(name);
            var node = this.sourceRow;
            obj.filterType = 'Active Fitlers';

            if (name === 'compare') {
                node = this.compareRow;
                obj.filterType = 'Comparison Filters';
            }

            var fragment = domConstruct.toDom(mustache.render(activeFilterTemplate, obj));

            var columns = fragment.children[1].children;
            var count = columns.length;
            var classes = 'col-xs-6 col-sm-2 col-md-2';

            if (count < 5) {
                var template = {
                    span: 12/count
                };

                classes = lang.replace('col-xs-6 col-sm-{span} col-md-{span}', template);
            }

            for (var i = 0; i < count; i++) {
                var div = columns[i];
                domClass.remove(div);
                domClass.add(div, classes);
            }

            domConstruct.place(fragment, name, 'only');
        },
        _setSourceAttr: function (criteria) {
            criteria = this._invokeProperties(lang.clone(criteria));

            this._set('source', criteria);
        },
        _setCompareAttr: function (criteria) {
            criteria = this._invokeProperties(lang.clone(criteria));

            this._set('compare', criteria);
        },
        _invokeProperties: function (obj) {
            // summary:
            //      ohhh recursion
            // the object to recurse over
            console.log('app.ActiveFilters::_invokeProperties', arguments);

            if (!obj) {
                return;
            }

            for (var i = 0; i < Object.keys(obj).length; i++) {
                var key = Object.keys(obj)[i];

                if (this.skipKeys.indexOf(key) > -1) {
                    continue;
                }
                console.debug(key);
                obj[key] = this['_' + key](obj[key]);
            }

            return obj;
        },
        _factors: function (arr) {
            // summary:
            //      map factor codes to values
            // array of codes
            console.log('app.ActiveFilters::_factors', arguments);

            var values = arr.map(function (code) {
                return code.replace(/_/g, ' ');
            });

            return values.join(', ');
        },
        _milepost: function (obj) {
            // summary:
            //      format milepost and county info
            // {route, milepost, to, from}
            console.log('app.ActiveFilters:_milepost', arguments);

            return lang.replace('Route {route} between milepost {from}-{to}', obj);
        },
        _date: function (obj) {
            // summary:
            //      handles the specificDays
            // obj
            console.log('app.ActiveFilters:_date', arguments);

            if (!obj.specificDays || obj.specificDays.length < 1) {
                return null;
            }

            var convertDay = function (code) {
                if (code === '1') {
                    return 'Sunday';
                }
                if (code === '2') {
                    return 'Monday';
                }
                if (code === '3') {
                    return 'Tuesday';
                }
                if (code === '4') {
                    return 'Wednesday';
                }
                if (code === '5') {
                    return 'Thursday';
                }
                if (code === '6') {
                    return 'Friday';
                }
                if (code === '7') {
                    return 'Saturday';
                }
            };

            var values = obj.specificDays.map(function (code) {
                return convertDay(code);
            });

            return values.join(', ');
        },
        _counties: function (arr) {
            // summary:
            //      handles the county
            // obj
            console.log('app.ActiveFilters:_counties', arguments);

            if (!arr || arr.length < 1) {
                return null;
            }

            return arr.join(', ');
        },
        _severity: function (arr) {
            // summary:
            //      handles the severity
            // obj
            console.log('app.ActiveFilters:_severity', arguments);

            if (!arr || arr.length < 1) {
                return null;
            }

            return arr.join(', ');
        },
        _weatherConditions: function (arr) {
            // summary:
            //      handles the weatherConditions
            // obj
            console.log('app.ActiveFilters:_weatherConditions', arguments);

            if (!arr || arr.length < 1) {
                return null;
            }

            var values = arr.map(function (code) {
                return code.replace(/'/g, '');
            });

            return values.join(', ');
        }
    });
});
