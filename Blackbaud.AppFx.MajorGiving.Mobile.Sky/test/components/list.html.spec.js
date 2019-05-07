/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('frog-list directive', function () {
    'use strict';

    var basicGridHtml,
        bbViewKeeperBuilder,
        bbWindow,
        $compile,
        dataSet1,
        $document,
        el,
        locals,
        $scope,
        $templateCache,
        $timeout,
        fxOff,
        $window;

    function setUpGrid(gridHtml, setLocals) {
        var el = angular.element(gridHtml);
        el.appendTo(document.body);

        if (angular.isDefined(setLocals)) {
            $scope.locals = setLocals;
        } else {
            $scope.locals = locals;
        }

        $compile(el)($scope);

        $scope.$digest();

        return el;
    }

    function setGridData(data) {
        $scope.locals.gridOptions.data = data;
        $scope.$digest();
    }

    function getGridRows(el) {
        return el.find('[bb-frog-testid="row"]');
    }

    function getSearchBox(el) {
        return el.find('.bb-grid-toolbar-container .bb-search-container input');
    }

    function getSearchIcon(el) {
        return el.find('.bb-grid-toolbar-container .bb-search-container .bb-search-icon');
    }

    beforeEach(module('ngMock'));
    beforeEach(module(
        'frog.list',
        'frog.templates',
        'sky.templates'
    ));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$document_, _$timeout_, _bbViewKeeperBuilder_, _$templateCache_, _$window_, _bbWindow_) {
        $scope = _$rootScope_;
        $compile = _$compile_;
        $document = _$document_;
        $timeout = _$timeout_;
        bbViewKeeperBuilder = _bbViewKeeperBuilder_;
        $window = _$window_;
        $templateCache = _$templateCache_;
        bbWindow = _bbWindow_;

        locals = {
            gridOptions: { }
        };

        dataSet1 = [
            {
                id: 'blarrrg',
                name: 'John',
                instrument: 'Rhythm guitar'
            },
            {
                name: 'Paul',
                instrument: 'Bass',
                bio: 'Lorem'
            },
            {
                name: 'George',
                instrument: 'Lead guitar'
            },
            {
                name: 'Ringo',
                instrument: 'Drums'
            }
        ];

        basicGridHtml = '<div><frog-list frog-list-options="locals.gridOptions"><frog-list-contents>' +
            '<div ng-repeat="thing in locals.gridOptions.data"><div class="frog-list-search" bb-frog-testid="row">{{thing.name}}</div></div>' +
            '</frog-list-contents></frog-list></div>';

        el = {};
        fxOff = $.fx.off;
        //turn off jquery animate.
        $.fx.off = true;
    }));

    afterEach(function () {
        if (angular.isDefined(el)) {
            if (angular.isFunction(el.remove)) {
                el.remove();
            }
        }
        $.fx.off = fxOff;
    });

    describe('fixed headers', function () {
        
        it('will not blow up if options are not specified', function () {
            locals = {};

            spyOn(bbViewKeeperBuilder, 'create').and.callThrough();

            el = setUpGrid(basicGridHtml, locals);

            expect(bbViewKeeperBuilder.create.calls.count()).toBe(1);
        });
    });

    describe('searching', function () {

        it('highlights searched items in rows if search text is set and data reloaded', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;

            $scope.$watch('locals.gridOptions.searchText', function () {
                $scope.locals.gridOptions.data = [dataSet1[0]];
            });

            el = setUpGrid(basicGridHtml);

            setGridData(dataSet1);

            searchEl = getSearchBox(el);

            searchEl.eq(0).val('John').trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();

            $scope.$digest();

            $timeout.flush();

            rowEl = getGridRows(el);

            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).toHaveClass('highlight');

        });

        it('highlights searched items in rows on second search', function () {

            var rowEl,
                searchEl,
                searchIconEl,
                searchText;

            $scope.$watch('locals.gridOptions.searchText', function () {
                if (!searchText) {
                    $scope.locals.gridOptions.data = dataSet1[0];
                } else if (searchText === 'John') {
                    $scope.locals.gridOptions.data = [dataSet1[0]];
                } else if (searchText === 'Paul') {
                    $scope.locals.gridOptions.data = [dataSet1[1]];
                }
                $scope.locals.gridOptions.dataReset = true;
            });

            el = setUpGrid(basicGridHtml);

            setGridData(dataSet1);

            searchEl = getSearchBox(el);

            searchText = "John";
            searchEl.eq(0).val(searchText).trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();

            $scope.$digest();

            $timeout.flush();

            rowEl = getGridRows(el);

            expect(rowEl.eq(0).html()).toBe('<span class="highlight">John</span>');

            searchText = "Paul";
            searchEl.eq(0).val(searchText).trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();

            $scope.$digest();

            $timeout.flush();

            rowEl = getGridRows(el);

            expect(rowEl.eq(0).html()).toBe('<span class="highlight">Paul</span>');

        });

        it('highlights searched items in rows if search text is set and data is not reloaded', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;

            $scope.$watch('locals.gridOptions.searchText', function () {
                $scope.locals.gridOptions.data = dataSet1;
            });

            el = setUpGrid(basicGridHtml);

            setGridData(dataSet1);

            searchEl = getSearchBox(el);

            searchEl.eq(0).val('John').trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();

            $scope.$digest();

            $timeout.flush();

            rowEl = getGridRows(el);

            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).toHaveClass('highlight');
        });

        it('clears searched item highlight when data set is not reloaded and items are searched again', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;

            $scope.$watch('locals.gridOptions.searchText', function () {
                $scope.locals.gridOptions.data = dataSet1;
            });

            el = setUpGrid(basicGridHtml);

            setGridData(dataSet1);

            searchEl = getSearchBox(el);

            searchEl.eq(0).val('John').trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();

            $scope.$digest();

            $timeout.flush();

            searchEl.eq(0).val('Paul').trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();
            $scope.$digest();

            rowEl = getGridRows(el);

            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).not.toHaveClass('highlight');

            spanEl = rowEl.eq(1).find('span');
            expect(spanEl.eq(0)).toHaveClass('highlight');
        });

        it('will clear highlight if search text is not set', function () {
            var rowEl,
                searchEl,
                searchIconEl,
                spanEl;

            $scope.$watch('locals.gridOptions.searchText', function () {
                $scope.locals.gridOptions.data = [dataSet1[0]];
            });

            el = setUpGrid(basicGridHtml);

            setGridData(dataSet1);

            searchEl = getSearchBox(el);

            searchEl.eq(0).val('John').trigger('change');

            searchIconEl = getSearchIcon(el);
            searchIconEl.eq(0).click();

            $scope.$digest();

            $timeout.flush();

            searchEl.eq(0).val('').trigger('change');
            searchIconEl.eq(0).click();

            $scope.$digest();

            $scope.locals.gridOptions.data = [dataSet1[0], dataSet1[1]];
            $scope.$digest();

            rowEl = getGridRows(el);

            spanEl = rowEl.eq(0).find('span');
            expect(spanEl.eq(0)).not.toHaveClass('highlight');

        });
    });

    describe("html formation", function () {

        it("elements are in the correct location", function () {

            var list,
                toolbar,
                clearfixSeparator,
                filters,
                contents;

            basicGridHtml = '<div><frog-list bb-frog-testid="list" frog-list-options="locals.gridOptions"><div bb-frog-testid="filters" /><frog-list-contents><div bb-frog-testid="contents"</frog-list-contents></frog-list></div>';

            el = setUpGrid(basicGridHtml);

            list = el.find("[bb-frog-testid='list']");
            expect(list).toExist("list");

            toolbar = list.find("[bb-frog-testid='toolbar']");
            expect(toolbar).toExist("toolbar");

            filters = toolbar.next();
            expect(filters).toExist("filters parent");
            filters = filters.children().first();
            expect(filters).toExist("filters");
            expect(filters).toHaveAttr("bb-frog-testid", "filters");

            clearfixSeparator = list.find("[bb-frog-testid='clearfixSeparator']");
            expect(clearfixSeparator).toExist("clearfixSeparator");

            contents = clearfixSeparator.next();
            expect(contents).toExist("contents grandparent");
            contents = contents.children().first();
            expect(contents).toExist("contents parent");
            contents = contents.children().first();
            expect(contents).toExist("contents");
            expect(contents).toHaveAttr("bb-frog-testid", "contents");

        });

    });

});
