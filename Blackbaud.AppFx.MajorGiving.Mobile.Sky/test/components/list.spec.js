/*jshint jasmine: true */
/*globals module, inject, angular, $ */

(function () {
    'use strict';

    var $compile,
        $rootScope,
        $scope,
        bbViewKeeperBuilder;

    function compileFormWithState(controllerState, listHtml) {
        controllerState = controllerState || {};

        var el,
            controller,
            scope;

        el = angular.element(listHtml);
        $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
        $rootScope.$apply();

        controller = el.controller("frogList");
        scope = el.isolateScope() || el.scope();

        // need to append to the body so that elements will be attached to the page dom and have a width etc.
        $('body').append(el);

        return {
            formDOM: el,
            controller: controller,
            scope: scope
        };
    }

    beforeEach(function () {
        module('frog.list');
        module('frog.templates');
        module('sky.templates');
    });

    beforeEach(inject(function (_$compile_, _$rootScope_, _bbViewKeeperBuilder_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        bbViewKeeperBuilder = _bbViewKeeperBuilder_;
    }));

    describe("frogList", function () {

        describe("directive", function () {

            it('Replaces the element with the appropriate content', function () {
                var element = $compile("<frog-list><frog-list-contents></frog-list-contents></frog-list>")($rootScope);
                $rootScope.$digest();
                expect(element.find("[bb-frog-testid='clearfixSeparator']")).toExist();
            });

            it('Requires list contents', function () {
                try {
                    $compile("<frog-list></frog-list>")($rootScope);
                } catch (ex) {
                    expect(ex.message).toBe("[$compile:reqslot] Required transclusion slot `frogListContents` was not filled.\n" +
                        "http://errors.angularjs.org/" + angular.version.full + "/$compile/reqslot?p0=frogListContents");
                }
            });

        });

        describe("controller", function () {

            it("creates expected functions and properties", function () {

                var form = compileFormWithState(
                    {
                        loading: true
                    },
                    "<frog-list><frog-list-contents></frog-list-contents></frog-list>"
                );

                expect(form.scope).toExist();
                expect(form.scope.locals).toBeDefined("locals");
                expect(form.scope.locals.hasColPicker).toBe(true, "hasColPicker");
                expect(form.scope.locals.hasFilters).toBe(true, "hasFilters");
                expect(form.scope.locals.applySearchText).toBeDefined("applySearchText");

                expect(form.controller).toExist("controller");
                expect(form.controller.setFilters).toExist("setFilters");
                expect(form.controller.syncViewKeepers).toExist("syncViewKeepers");
                expect(form.controller.highlightSearchText).toExist("highlightSearchText");
                expect(form.controller.scope).toExist("scope");
                expect(form.controller.scope).toBe(form.scope, "scope");

            });

            describe("setFilters", function () {

                it("sets filters property and performs appropriate actions", function () {

                    var form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect(form.scope.options.filters).not.toExist();
                    spyOn(form.scope.locals, 'applySearchText').and.callThrough();

                    form.scope.locals.setFilters("testFilters");

                    expect(form.scope.options.filters).toBe("testFilters");
                    expect(form.scope.locals.applySearchText.calls.count()).toBe(1);

                });

            });

            describe("syncViewKeepers", function () {

                it("performs appropriate actions", function () {

                    var form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect(form.scope.syncViewKeepers).toBeDefined();
                    form.scope.syncViewKeepers();

                });

            });

            describe("highlightSearchText", function () {

                it("performs appropriate actions", function () {

                    var form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect(form.controller.highlightSearchText).toBeDefined();
                    form.controller.highlightSearchText();

                });

            });

            describe("applySearchText", function () {

                it("performs appropriate actions", function () {

                    var form,
                        functionCalled = false;

                    form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    form.controller.applySearchText = function () {
                        functionCalled = true;
                    };

                    expect(form.scope.locals.applySearchText).toBeDefined();
                    form.scope.locals.applySearchText();

                    expect(functionCalled).toBe(true);

                });

            });

            describe("options", function () {

                it("viewKeeperOffsetElId", function () {

                    $scope.testListOptions = {
                        viewKeeperOffsetElId: "testElId"
                    };

                    spyOn(bbViewKeeperBuilder, 'create').and.callThrough();

                    var form,
                        functionCalled = false,
                        functionArg;

                    form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list frog-list-options='testListOptions'><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect(bbViewKeeperBuilder.create.calls.count()).toBe(1);

                    expect(bbViewKeeperBuilder.create).toHaveBeenCalledWith({
                        el: form.formDOM.find('.bb-grid-toolbar-viewkeeper')[0],
                        setWidth: true,
                        verticalOffSetElId: "testElId",
                        boundaryEl: form.formDOM.find("[ng-transclude='frogListContents']")
                    });

                    form.controller.viewKeeperChangedHandler = function (arg) {
                        functionCalled = true;
                        functionArg = arg;
                    };

                    form.scope.options.viewKeeperOffsetElId = "testElId2";

                    $rootScope.$apply();

                    expect(bbViewKeeperBuilder.create.calls.count()).toBe(2);

                    expect(bbViewKeeperBuilder.create).toHaveBeenCalledWith({
                        el: form.formDOM.find('.bb-grid-toolbar-viewkeeper')[0],
                        setWidth: true,
                        verticalOffSetElId: "testElId2",
                        boundaryEl: form.formDOM.find("[ng-transclude='frogListContents']")
                    });

                    expect(functionCalled).toBe(true);
                    expect(functionArg).toBe("testElId2");

                });

                it("filters", function () {

                    $scope.testListOptions = {
                        filters: "testFilter1"
                    };

                    var form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list frog-list-options='testListOptions'><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    spyOn(form.scope, "$broadcast").and.callThrough();

                    expect(form.scope.options.filters).toBe("testFilter1");

                    form.scope.options.filters = "testFilter2";

                    $rootScope.$apply();

                    expect(form.scope.$broadcast).toHaveBeenCalledWith("updateAppliedFilters", "testFilter2");

                });

                it("searchText", function () {

                    $scope.testListOptions = {
                        searchText: "test 1"
                    };

                    var form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list frog-list-options='testListOptions'><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect(form.scope.options.searchText).toBe("test 1");

                });

                it("fixedToolbar", function () {

                    $scope.testListOptions = {
                        viewKeeperOffsetElId: "testElId",
                        fixedToolbar: true
                    };

                    spyOn(bbViewKeeperBuilder, 'create').and.callThrough();

                    var form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list frog-list-options='testListOptions'><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect(bbViewKeeperBuilder.create.calls.count()).toBe(0);

                    form.scope.options.fixedToolbar = false;

                    $rootScope.$apply();

                    expect(bbViewKeeperBuilder.create.calls.count()).toBe(1);

                    expect(bbViewKeeperBuilder.create).toHaveBeenCalledWith({
                        el: form.formDOM.find('.bb-grid-toolbar-viewkeeper')[0],
                        setWidth: true,
                        verticalOffSetElId: "testElId",
                        boundaryEl: form.formDOM.find("[ng-transclude='frogListContents']")
                    });

                });

                it("sets the margin when filters are visible", function () {

                    $scope.testListOptions = {
                        filtersVisible: true
                    };

                    var form;

                    form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list frog-list-options='testListOptions'><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect($scope.testListOptions.contentsPaddingTop).toBe("100px");

                });

                it("sets the margin when filters are not visible", function () {

                    $scope.testListOptions = {
                        filtersVisible: false
                    };

                    var form;

                    form = compileFormWithState(
                        {
                            loading: true
                        },
                        "<frog-list frog-list-options='testListOptions'><frog-list-contents></frog-list-contents></frog-list>"
                    );

                    expect($scope.testListOptions.contentsPaddingTop).toBe("43px");

                });

            });

        });

    });

}());
