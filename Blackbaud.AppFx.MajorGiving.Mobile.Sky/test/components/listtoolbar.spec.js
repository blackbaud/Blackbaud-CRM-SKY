/*jshint browser: true, jasmine: true */
/*global angular, inject, module, $ */

describe('Grid toolbars', function () {
    'use strict';

    var basicGridHtml,
        bbViewKeeperBuilder,
        $compile,
        $animate,
        $document,
        el,
        fxOff,
        locals,
        $rootScope,
        $scope,
        options;

    function setUpGrid(gridHtml, setLocals) {
        var el = angular.element(gridHtml);

        $document.find('body').eq(0).append(el);

        if (angular.isDefined(setLocals)) {
            $scope.locals = setLocals;
        } else {
            $scope.locals = locals;
        }

        $compile(el)($scope);
        $rootScope.$apply();

        $animate.flush();
        $rootScope.$digest();

        return el;
    }

    function setOptions(options) {
        locals.gridOptions = options;
        $rootScope.$digest();
    }

    //function clickSortButton() {

    //    var sortButtonEl = el.find('.frog-sort-btn');
    //    expect(sortButtonEl).toBeVisible("sort button should be visible");

    //    sortButtonEl.click();

    //    $animate.flush();
    //    $scope.$digest();

    //}

    beforeEach(module('ngMock'));
    beforeEach(module(
        'ngAnimateMock',
        'ui.bootstrap.dropdown',
        'sky.templates',
        'sky.contextmenu.item.directive',
        'frog.list',
        'frog.templates'
    ));

    beforeEach(inject(function (_$rootScope_, _$compile_, _$animate_, _$document_, _bbViewKeeperBuilder_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $compile = _$compile_;
        $animate = _$animate_;

        $document = _$document_;

        bbViewKeeperBuilder = _bbViewKeeperBuilder_;

        locals = {
        };

        options = {
            data: []
        };

        basicGridHtml = '<div><frog-list frog-list-options="locals.gridOptions"><frog-list-contents></frog-list-contents></frog-list></div>';

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

    describe('inline filters', function () {
        it('will toggle the visibility of the filters if the hasInlineFilters option is specified and it will react to options.filtersAreActive change', function () {

            var inlineHtml = '<div><frog-list frog-list-options="locals.gridOptions"><div class="bb-filters-inline"><input class="hehe" type="checkbox" ng-model="locals.gridOptions.filters.check"/></div><frog-list-contents></frog-list-contents></frog-list></div>',
                filterButtonEl,
                filterInputEl;
            setOptions(options);
            locals.gridOptions.hasInlineFilters = true;
            locals.gridOptions.filters = {
                check: false
            };

            el = setUpGrid(inlineHtml, locals);



            filterInputEl = el.find('.hehe');

            expect(filterInputEl).not.toBeVisible("filters visible upon creation");

            filterButtonEl = el.find('.bb-filter-btn');

            filterButtonEl.click();

            $scope.$digest();

            expect(filterInputEl).toBeVisible();

            $scope.locals.gridOptions.filters.check = true;
            $scope.locals.gridOptions.filtersAreActive = true;
            $scope.$digest();


            expect(filterButtonEl).toHaveClass('bb-filters-inline-active');

            expect($scope.locals.gridOptions.filters.check).toBe(true);


            $scope.locals.gridOptions.filters.check = false;
            $scope.locals.gridOptions.filtersAreActive = false;
            $scope.$digest();

            expect(filterButtonEl).not.toHaveClass('bb-filters-inline-active');

            expect($scope.locals.gridOptions.filters.check).toBe(false);

            filterButtonEl.click();

            $scope.$digest();

            expect(filterInputEl).not.toBeVisible();

        });

        it('will set the visibility of the filters if options.filtersOpen is defined', function () {
            var inlineHtml = '<div><frog-list frog-list-options="locals.gridOptions"><div class="bb-filters-inline"><input class="hehe" type="checkbox" ng-model="locals.gridOptions.filters.check"/></div><frog-list-contents></frog-list-contents></frog-list></div>',
                filterInputEl;
            setOptions(options);
            locals.gridOptions.hasInlineFilters = true;
            locals.gridOptions.filtersOpen = true;

            el = setUpGrid(inlineHtml, locals);


            filterInputEl = el.find('.hehe');

            expect(filterInputEl).not.toBeVisible();

            locals.gridOptions.filtersOpen = true;
            $scope.$digest();

            expect(filterInputEl).toBeVisible();

            $scope.$destroy();

        });

    });

    xdescribe("modal filters", function () {

        it('calls the parent\'s toggle filters function', function () {

            var html = '<div><frog-list frog-list-options="locals.gridOptions"><bb-grid-filters><input class="hehe" type="checkbox" ng-model="locals.gridOptions.filters.check"/></bb-grid-filters><frog-list-contents></frog-list-contents></frog-list></div>',
                filterButtonEl,
                filterInputEl,
                controller,
                toggleFilterMenuCalled = false,
                toggleFilterMenuArg;
            setOptions(options);
            locals.gridOptions.filters = {
                check: false
            };

            el = setUpGrid(html, locals);
            controller = el.controller("frogList");

            controller.toggleFilterMenu = function (isOpen) {
                toggleFilterMenuCalled = true;
                toggleFilterMenuArg = isOpen;
            };

            filterInputEl = el.find('.hehe');

            expect(filterInputEl).not.toBeVisible("filters visible upon creation");

            filterButtonEl = el.find('.bb-filter-btn');

            filterButtonEl.click();

            $scope.$digest();

            expect(filterInputEl).toBeVisible();

            $scope.locals.gridOptions.filters.check = true;
            $scope.locals.gridOptions.filtersAreActive = true;
            $scope.$digest();


            //expect(filterButtonEl).toHaveClass('bb-filters-inline-active');

            expect($scope.locals.gridOptions.filters.check).toBe(true);


            $scope.locals.gridOptions.filters.check = false;
            $scope.locals.gridOptions.filtersAreActive = false;
            $scope.$digest();

            //expect(filterButtonEl).not.toHaveClass('bb-filters-inline-active');

            expect($scope.locals.gridOptions.filters.check).toBe(false);

            filterButtonEl.click();

            $scope.$digest();

            expect(filterInputEl).not.toBeVisible();

            expect(toggleFilterMenuCalled).toBe(true, "toggleFilterMenuCalled");
            expect(toggleFilterMenuArg).toBe(true, "toggleFilterMenuArg");

        });

    });

    //describe("sort", function () {

    //    it("TODO", function () {

    //        var sortDropdownEl,
    //            //sortOption1El,
    //            //sortOption2El,
    //            controller;

    //        options.hideFilters = true;

    //        options.hideSort = false;

    //        options.sortOptionSelected = jasmine.createSpy("sortOptionSelected spy")/*.and.callFake(function (i) {
    //            console.log("sortOptionSelected " + i);
    //        })*/;

    //        options.sortOptions = [
    //            {
    //                title: "Option 1",
    //                selected: true
    //            },
    //            {
    //                title: "Option 2"
    //            }
    //        ];


    //        setOptions(options);

    //        el = setUpGrid(basicGridHtml, locals);
    //        controller = el.controller("frogList");

    //        sortDropdownEl = el.find('[bb-frog-testid="sortDropdown"]');
    //        //sortOption1El = el.find("[bb-frog-testid='sortItem'][data-bbauto-index=0]>li>a");
    //        //sortOption2El = el.find("[bb-frog-testid='sortItem'][data-bbauto-index=1]>li>a");

    //        //expect($scope.locals.gridOptions.sortOpen).not.toBeDefined("sort menu should be closed to start");
    //        expect($scope.locals.gridOptions.sortOpen).toBe(false, "sort menu should be closed to start");
    //        //expect(el.find(".frog-list-toolbar-contextmenu")).not.toBeVisible("sort menu visible upon creation")
    //        expect(el.find(".frog-list-toolbar-contextmenu")).not.toHaveClass("open");
    //        //expect(sortDropdownEl).not.toBeVisible("sort menu visible upon creation");
    //        //expect(sortOption1El).not.toBeVisible("sort menu option visible upon creation");
    //        //expect(sortOption2El).not.toBeVisible("sort menu option visible upon creation");
    //        expect(locals.gridOptions.sortOptionSelected.calls.count()).toBe(0, "sortOptionSelected");

    //        console.log("Clicking");
    //        clickSortButton();

    //        //console.log("html: " + el.html());
    //        console.log("class: " + el.find(".frog-list-toolbar-contextmenu").attr("class"));

    //        console.log("test options: " + JSON.stringify($scope.locals.gridOptions));

    //        expect($scope.locals.gridOptions.sortOpen).toBe(true, "sort menu should be open after button is clicked");
    //        //// TODO ChristineVi I can't figure out how to test if the dropdown is open.
    //        //// I don't see any examples in SKY tests that do this.
    //        //// Spent too much time on it already, hope to come back to it later.
    //        //expect(sortDropdownEl).toBeVisible("sort menu not visible after button is clicked");
    //        expect(el.find(".frog-list-toolbar-contextmenu")).toHaveClass("open");
    //        ////expect(sortOption1El).toBeVisible("sort menu option should be visible");
    //        ////expect(sortOption2El).toBeVisible("sort menu option should be visible");
    //        ////expect(sortDropdownEl).toBeVisible();
    //        ////expect(sortOption1El).toHaveClass("in");
    //        ////expect(el.find('div.frog-list-toolbar-contextmenu.dropdown').length).toBe(1);
    //        ////expect(el.find('ul.dropdown-menu')).toBeVisible();

    //        //sortOption2El.click();
    //        //$scope.locals.gridOptions.sortOptions[0].selected = false;
    //        //$scope.locals.gridOptions.sortOptions[1].selected = true;
    //        //$scope.locals.gridOptions.sortIsActive = true;
    //        ////$animate.flush();
    //        //$scope.$digest();


    //        //expect(sortButtonEl).toHaveClass('frog-sort-inline-active');
    //        //expect(locals.gridOptions.sortOptionSelected).toHaveBeenCalledWith(1);

    //        //sortOption1El.click();
    //        //$scope.locals.gridOptions.sortOptions[0].selected = true;
    //        //$scope.locals.gridOptions.sortOptions[1].selected = false;
    //        //$scope.locals.gridOptions.sortIsActive = false;
    //        //$scope.$digest();

    //        //expect(sortButtonEl).not.toHaveClass('frog-sort-inline-active');

    //        //sortButtonEl.click();

    //        //$scope.$digest();

    //        //expect(sortDropdownEl).not.toBeVisible();

    //        //expect($scope.locals.gridOptions.sortOpen).toBe(false, "sort menu should be closed after button is clicked");

    //    });

    //});

    describe('searching', function () {
        it('sets searchText on search', function () {
            var searchEl,
                searchIconEl;

            el = setUpGrid(basicGridHtml);
            setOptions(options);

            searchEl = el.find('.bb-grid-toolbar-container .bb-search-container input');

            searchEl.eq(0).val('John').trigger('change');

            searchIconEl = el.find('.bb-grid-toolbar-container .bb-search-container .bb-search-icon');
            searchIconEl.eq(0).click();

            $scope.$digest();

            expect($scope.locals.gridOptions.searchText).toBe('John');

        });
    });

    describe('custom toolbar', function () {
        it('can have custom controls on the toolbar', function () {
            var customClicked = false,
                customToolbarGridHtml = '<div><frog-list frog-list-options="locals.gridOptions" frog-list-custom-toolbar><frog-list-toolbar><button type="button" class="btn bb-btn-secondary bb-grid-toolbar-btn bb-test-button" ng-click="locals.clickCustom()">This is a custom button</button></frog-list-toolbar><frog-list-contents></frog-list-contents></frog-list></div>';
            locals.clickCustom = function () {
                customClicked = true;
            };

            el = setUpGrid(customToolbarGridHtml, locals);
            setOptions(options);

            el.find('.bb-test-button').click();

            expect(customClicked).toBe(true);
        });
    });

});
