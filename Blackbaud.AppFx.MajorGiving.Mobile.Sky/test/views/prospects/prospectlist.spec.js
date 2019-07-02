/*jshint jasmine: true */
/*globals module, inject, setTimeout, angular */

(function () {
    'use strict';

    describe('prospectlist', function () {

        var $rootScope,
            $scope,
            $controller,
            $state,
            $injector,
            bbWait,
            $timeout,
            $q,
            API,
            getPortfolioIsSuccessful,
            getPortfolioFailureData,
            windowTitle,
            prospects,
            primaryProspects,
            sortedProspects,
            sortedPrimaryProspects,
            settingsWait,
            portfolioWait,
            portfolioSettings,
            portfolioSettingsFail;

        beforeEach(function () {
            module('infinity.util');
            module('frog.api');

            module(function ($provide) {

                function getPortfolioAsync(options) {
                    options = options || {};
                    options.onlyPrimary = !!options.onlyPrimary;
                    options.sort = options.sort || 0;

                    var result,
                        deferred = $q.defer();
                    
                    if (portfolioWait) {
                        setTimeout(complete, portfolioWait);
                    } else {
                        complete();
                    }

                    return deferred.promise;

                    function complete() {
                        if (getPortfolioIsSuccessful) {
                            if (options.onlyPrimary) {
                                if (options.sort) {
                                    result = sortedPrimaryProspects;
                                } else {
                                    result = primaryProspects;
                                }
                            } else if (options.sort) {
                                result = sortedProspects;
                            } else {
                                result = prospects;
                            }

                            return deferred.resolve({
                                prospects: result
                            });
                        }

                        return deferred.reject(getPortfolioFailureData);
                    }
                }

                function getPortfolioSettingsAsyncWait(successCallback, failureCallback, finallyCallback) {

                    if (settingsWait) {
                        setTimeout(function () {
                            getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
                        }, settingsWait);
                    } else {
                        getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback);
                    }

                }

                function getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback) {

                    successCallback = successCallback || angular.noop;
                    failureCallback = failureCallback || angular.noop;
                    finallyCallback = finallyCallback || angular.noop;

                    if (portfolioSettingsFail) {
                        failureCallback({
                            message: "Test error 2"
                        });
                    } else {
                        successCallback(portfolioSettings);
                    }
                    finallyCallback();
                    $scope.$digest();

                }

                $provide.value("api", {
                    initialize: angular.noop,
                    getDatabaseName: function () {
                        return "BBInfinityMock";
                    },
                    getPortfolioAsync: getPortfolioAsync,
                    getPortfolioSettingsAsync: getPortfolioSettingsAsyncWait
                });

            });

            module('frog');

            windowTitle = null;

            module(function ($provide, bbWindowProvider) {

                var bbWindow = bbWindowProvider.$get();
                bbWindow.setWindowTitle = function (title) {
                    windowTitle = title;
                };
                $provide.value("bbWindow", bbWindow);

            });

        });

        //Inject objects needed to drive the controller
        beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$injector_, _bbWait_, _$timeout_, _$q_, _api_) {

            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $state = _$state_;
            $injector = _$injector_;
            bbWait = _bbWait_;
            $timeout = _$timeout_;
            $q = _$q_;
            API = _api_;

            $scope = _$rootScope_.$new();

        }));

        describe("ProspectListController", function () {

            var pageTitle,
                controller;

            beforeEach(function () {

                pageTitle = "Test Title";

                controller = null;

                getPortfolioIsSuccessful = true;

                getPortfolioFailureData = {
                    message: "Test error 1"
                };

                prospects = [
                    {
                        name: "User One",
                        id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                    },
                    {
                        name: "User Two",
                        id: "75896cda-5635-4f59-a261-956c476667aa"
                    }
                ];
                primaryProspects = null;
                sortedProspects = [prospects[1], prospects[0]];
                sortedPrimaryProspects = null;

                settingsWait = 0;
                portfolioWait = 0;

                portfolioSettings = {
                    onlyPrimary: false,
                    sort: 0
                };
                portfolioSettingsFail = false;

            });

            function initializeController() {

                controller = $controller("ProspectListController", {
                    $scope: $scope,
                    pageTitle: pageTitle
                });

            }

            describe("basic functionality", function () {

                it("initialize sets expected values and loads the portfolio", function (done) {

                    settingsWait = 2000;

                    initializeController();

                    expect(windowTitle).toBe(pageTitle);
                    expect($scope.resources).toBeDefined();
                    expect($scope.resources.portfolio_filter_allprospects).toBe("All my prospects");
                    expect($scope.resources.portfolio_filter_primaryprospects).toBe("My primary prospects");
                    expect($scope.resources.portfolio_nosearchresults).toBe("No prospects found.");
                    expect($scope.toolbarOptions).toBeDefined("toolbarOptions");
                    expect($scope.toolbarOptions.hideFilters).toBe(false, "hideFilters");
                    expect($scope.toolbarOptions.hasInlineFilters).toBe(true, "hasInlineFilters");
                    expect($scope.toolbarOptions.hideSort).toBe(false, "hideSort");
                    expect($scope.toolbarOptions.sortOptionSelected).toBeDefined("sortOptionSelected");
                    expect($scope.toolbarOptions.sortOptions).not.toBeDefined("sortOptions");

                    // Let this value be defined as whatever it had been set to by the calling scope.
                    expect($scope.portfolioCount).not.toBeDefined();

                    expect(controller.loading).toBe(true, "loading");
                    expect(controller.data).not.toBeDefined();
                    expect(controller.loadError).not.toBeDefined();

                    setTimeout(function () {

                        expect(windowTitle).toBe(pageTitle);
                        expect(controller.loading).toBe(false, "loading");
                        expect($scope.portfolioCount).toBe("My portfolio (2)");
                        expect(controller.data).toEqual({
                            prospects: prospects
                        });
                        expect(controller.loadError).not.toBeDefined();
                        expect($scope.toolbarOptions.sortOptions).toEqual([
                            {
                                title: "Last name",
                                selected: true
                            },
                            {
                                title: "Next step"
                            }
                        ]);

                        done();
                    }, settingsWait + 1000);

                });

                it("get portfolio failure sets expected values", function () {

                    getPortfolioIsSuccessful = false;

                    initializeController();

                    expect(windowTitle).toBe(pageTitle);
                    expect($scope.resources).toBeDefined();
                    expect($scope.portfolioCount).not.toBeDefined();
                    expect(controller.loading).toBe(false, "loading");
                    expect(controller.data).not.toBeDefined();
                    expect(controller.loadError).toBe("Error loading portfolio. Test error 1");

                });

                it("no primary prospects sets expected values", function (done) {

                    primaryProspects = [];

                    initializeController();

                    expect(windowTitle).toBe(pageTitle);
                    expect(controller.loading).toBe(false, "loading");
                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });
                    expect(controller.loadError).not.toBeDefined();

                    expect($scope.toolbarOptions.filters).toEqual({
                        prospectsFilter: ""
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    setTimeout(function () {

                        expect(windowTitle).toBe(pageTitle);
                        expect(controller.loading).toBe(false, "loading");
                        expect($scope.portfolioCount).toBe("My portfolio (0)");
                        expect(controller.data).toEqual({
                            prospects: []
                        });
                        expect(controller.loadError).not.toBeDefined();

                        done();
                    }, settingsWait + 1000);

                });

            });

            describe("waits", function () {

                it('while the list is loading', function (done) {

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    settingsWait = 2000;

                    initializeController();

                    expect(controller.loading).toBe(true, "loading");
                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(0, "endPageWait 1");
                    expect(controller.data).not.toBeDefined();
                    expect(controller.loadError).not.toBeDefined();

                    setTimeout(function () {

                        expect(controller.loading).toBe(false, "loading");
                        expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                        expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");
                        expect($scope.portfolioCount).toBe("My portfolio (2)");
                        expect(controller.data).toEqual({
                            prospects: prospects
                        });
                        expect(controller.loadError).not.toBeDefined();

                        done();
                    }, settingsWait + 1000);

                });

                it('when the filter changes', function (done) {

                    // Test set up

                    primaryProspects = [prospects[0]];

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    settingsWait = 2000;

                    initializeController();

                    // Check that the controller is waiting.

                    expect(controller.loading).toBe(true, "loading 1");
                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(0, "endPageWait 1");
                    expect(controller.data).not.toBeDefined();
                    expect(controller.loadError).not.toBeDefined();

                    // Wait for the list to finish loading.
                    setTimeout(function () {

                        // Check that the controller is no longer waiting.

                        expect(controller.loading).toBe(false, "loading 2");
                        expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 2");
                        expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");
                        expect($scope.portfolioCount).toBe("My portfolio (2)");
                        expect(controller.data).toEqual({
                            prospects: prospects
                        });
                        expect(controller.loadError).not.toBeDefined();

                        expect($scope.toolbarOptions.filters).toEqual({
                            prospectsFilter: ""
                        });

                        // Change the filter.

                        portfolioWait = settingsWait;
                        $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                        $scope.$digest();

                        // Check that the controller is waiting.

                        expect(controller.loading).toBe(true, "loading 3");
                        expect(bbWait.beginPageWait.calls.count()).toBe(2, "beginPageWait 3");
                        expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 3");
                        expect(controller.data).toEqual({
                            prospects: prospects
                        });
                        expect(controller.loadError).not.toBeDefined();

                        // Wait for the list to finish loading.
                        setTimeout(function () {
                            $scope.$digest();
                            expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters not active after setting to primary");

                            // Check that the controller is no longer waiting.

                            expect(controller.loading).toBe(false, "loading 4");
                            expect(bbWait.beginPageWait.calls.count()).toBe(2, "beginPageWait 4");
                            expect(bbWait.endPageWait.calls.count()).toBe(2, "endPageWait 4");
                            expect($scope.portfolioCount).toBe("My portfolio (1)");
                            expect(controller.data).toEqual({
                                prospects: primaryProspects
                            });
                            expect(controller.loadError).not.toBeDefined();

                            done();

                        }, settingsWait + 1000);

                    }, settingsWait + 1000);

                }, 10000);

                it('stops waiting if you navigate away', function () {

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    settingsWait = 2000;

                    initializeController();

                    expect(controller.loading).toBe(true, "loading");
                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(0, "endPageWait 1");
                    expect(controller.data).not.toBeDefined();
                    expect(controller.loadError).not.toBeDefined();

                    $scope.$broadcast("$stateChangeSuccess");

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");

                });

                it('does nothing if you navigate away when not waiting', function () {

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    initializeController();

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 1");
                    expect($scope.portfolioCount).toBe("My portfolio (2)");

                    $scope.$broadcast("$stateChangeSuccess");

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");

                });

            });

            describe("search", function () {

                it("reduces the list data and returns it when cleared", function () {

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    var reducedProspects = [prospects[0], prospects[2]];

                    initializeController();

                    expect($scope.toolbarOptions.searchText).not.toBeDefined("searchText");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.searchText = "joh";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.searchText = "";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                });

                it("reduces the list data to nothing when there are no matches", function () {

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    initializeController();

                    expect($scope.toolbarOptions.searchText).not.toBeDefined("searchText");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.searchText = "asdf";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (0)");
                    expect(controller.data).toEqual({
                        prospects: []
                    });

                    $scope.toolbarOptions.searchText = "";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                });

                it("works with no prospects", function () {

                    primaryProspects = [];
                    portfolioSettings.onlyPrimary = true;

                    initializeController();

                    expect($scope.toolbarOptions.searchText).not.toBeDefined("searchText");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (0)");
                    expect(controller.data).toEqual({
                        prospects: []
                    });

                    $scope.toolbarOptions.searchText = "asdf";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (0)");
                    expect(controller.data).toEqual({
                        prospects: []
                    });

                });

                it("counts correctly for multiple matches", function () {

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    var reducedProspects = [prospects[1], prospects[2]];

                    initializeController();

                    expect($scope.toolbarOptions.searchText).not.toBeDefined("searchText");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.searchText = "e";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.searchText = "";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                });

                it("restores the portfolio when searching and filtering together", function () {

                    /* Open portfolio
                     * Search to return one prospect who is not in primary portfolio
                     * Filter to primary
                     * Filter to all
                     * Filter to primary
                     * Filter to all
                     * Remove search text
                     * Filter to primary
                     */

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    primaryProspects = [prospects[0], prospects[3]];

                    var reducedProspects = [prospects[2]],
                        prospectsCopy = [];

                    prospects.forEach(function (prospect) {
                        prospectsCopy.push(prospect);
                    });

                    initializeController();

                    expect($scope.toolbarOptions.searchText).not.toBeDefined("searchText");

                    expect($scope.toolbarOptions.filters).toEqual({
                        prospectsFilter: ""
                    });

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters should be inactive to start");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospectsCopy
                    });

                    $scope.toolbarOptions.searchText = "little";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (1)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters not active after setting to primary");

                    expect($scope.portfolioCount).toBe("My portfolio (0)");
                    expect(controller.data).toEqual({
                        prospects: []
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters active after setting to default");

                    expect($scope.portfolioCount).toBe("My portfolio (1)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters not active after setting to primary");

                    expect($scope.portfolioCount).toBe("My portfolio (0)");
                    expect(controller.data).toEqual({
                        prospects: []
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters active after setting to default");

                    expect($scope.portfolioCount).toBe("My portfolio (1)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.searchText = "";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospectsCopy
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters not active after setting to primary");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: primaryProspects
                    });

                });

                it("restores the portfolio when searching and sorting together", function () {

                    /* Open portfolio
                     * Search to return reduced portfolio
                     * Sort by next step
                     * Sort by last date
                     * Sort by next step
                     * Sort by last date
                     * Remove search text
                     * Sort by next step
                     */

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    sortedProspects = [prospects[3], prospects[2], prospects[1], prospects[0]];

                    var reducedProspects = [prospects[0], prospects[3]],
                        reducedSortedProspects = [prospects[3], prospects[0]],
                        prospectsCopy = [];

                    prospects.forEach(function (prospect) {
                        prospectsCopy.push(prospect);
                    });

                    initializeController();

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.searchText).not.toBeDefined("searchText");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step"
                        }
                    ]);

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort should be inactive to start");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospectsCopy
                    });

                    $scope.toolbarOptions.searchText = "Smith";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedSortedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort active after setting to default");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedSortedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort active after setting to default");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: reducedProspects
                    });

                    $scope.toolbarOptions.searchText = "";
                    $scope.$digest();

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospectsCopy
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: sortedProspects
                    });

                });

            });

            describe("filters", function () {

                it("out primary prospects", function () {

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    primaryProspects = [prospects[0], prospects[3]];

                    initializeController();

                    expect($scope.toolbarOptions.filters).toEqual({
                        prospectsFilter: ""
                    });

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters should be inactive to start");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters not active after setting to primary");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: primaryProspects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters active after setting to default");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                });

                it("sets expected filters when user settings are set to only show primary prospects", function () {

                    portfolioSettings.onlyPrimary = true;

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    primaryProspects = [prospects[0], prospects[3]];

                    initializeController();

                    expect($scope.toolbarOptions.filters).toEqual({
                        prospectsFilter: "optionPrimary"
                    });

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters should be active to start");
                    expect($scope.toolbarOptions.filtersOpen).toBe(true, "filters should be shown to start");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: primaryProspects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters active after setting to default");
                    expect($scope.toolbarOptions.filtersOpen).toBe(true, "filters should be shown to start");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters should be active to start");
                    expect($scope.toolbarOptions.filtersOpen).toBe(true, "filters should be shown to start");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: primaryProspects
                    });

                });

            });

            describe("sort", function () {

                it("by next step", function () {

                    initializeController();

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort should be inactive to start");
                    expect($scope.toolbarOptions.sortOptionSelected).toBeDefined("sortOptionSelected");

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step"
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: false
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort active after setting to default");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step",
                            selected: false
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                });

                it("sets expected sort when user settings are set to sort by next step", function () {

                    portfolioSettings.sort = 1;

                    initializeController();

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort should be active to start");
                    expect($scope.toolbarOptions.sortOptionSelected).toBeDefined("sortOptionSelected");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name"
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort active after setting to default");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step",
                            selected: false
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: false
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedProspects
                    });

                });

                it("does not load the list when the same option is selected", function () {

                    spyOn(API, "getPortfolioAsync").and.callThrough();

                    initializeController();

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort should be inactive to start");
                    expect($scope.toolbarOptions.sortOptionSelected).toBeDefined("sortOptionSelected");

                    expect(controller.loading).toBe(false, "loading");
                    expect(API.getPortfolioAsync.calls.count()).toBe(1, "getPortfolioAsync 1");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step"
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.$digest();

                    expect(API.getPortfolioAsync.calls.count()).toBe(1, "getPortfolioAsync 2");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step"
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect(API.getPortfolioAsync.calls.count()).toBe(2, "getPortfolioAsync 3");

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: false
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect(API.getPortfolioAsync.calls.count()).toBe(2, "getPortfolioAsync 4");

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: false
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedProspects
                    });

                });

            });

            describe("filters and sorts", function () {

                beforeEach(function () {

                    prospects = [
                        {
                            name: "John Smith",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "Robert Hernandez",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        },
                        {
                            name: "Little John",
                            id: "85a235a2-6156-4dfd-970a-d92ea6d75705"
                        },
                        {
                            name: "Bob Smith",
                            id: "fc9cb1c6-6a0c-4248-b689-5cf5ab7016b0"
                        }
                    ];

                    primaryProspects = [prospects[0], prospects[3]];
                    sortedProspects = [prospects[3], prospects[2], prospects[1], prospects[0]];
                    sortedPrimaryProspects = [prospects[3], prospects[0]];

                });

                it("at the same time", function () {

                    initializeController();

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.filters).toEqual({
                        prospectsFilter: ""
                    });

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters should be inactive to start");

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort should be inactive to start");
                    expect($scope.toolbarOptions.sortOptionSelected).toBeDefined("sortOptionSelected");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step"
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters not active after setting to primary");

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: false
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedPrimaryProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.toolbarOptions.filters.prospectsFilter = "";
                    $scope.$digest();

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters active after setting to default");

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort active after setting to default");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step",
                            selected: false
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                });

                it("sets expected settings when user settings are set", function () {

                    portfolioSettings = {
                        onlyPrimary: true,
                        sort: 1
                    };

                    initializeController();

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.filters).toEqual({
                        prospectsFilter: "optionPrimary"
                    });

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters should be active to start");
                    expect($scope.toolbarOptions.filtersOpen).toBe(true, "filters should be shown to start");

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort should be active to start");
                    expect($scope.toolbarOptions.sortOptionSelected).toBeDefined("sortOptionSelected");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name"
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedPrimaryProspects
                    });

                    $scope.toolbarOptions.sortOptionSelected(0);
                    $scope.toolbarOptions.filters.prospectsFilter = "";
                    $scope.$digest();

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.filtersAreActive).toBe(false, "filters active after setting to default");
                    expect($scope.toolbarOptions.filtersOpen).toBe(true, "filters should be shown to start");

                    expect($scope.toolbarOptions.sortIsActive).toBe(false, "sort active after setting to default");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: true
                        },
                        {
                            title: "Next step",
                            selected: false
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (4)");
                    expect(controller.data).toEqual({
                        prospects: prospects
                    });

                    $scope.toolbarOptions.sortOptionSelected(1);
                    $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                    $scope.$digest();

                    expect(controller.loading).toBe(false, "loading");

                    expect($scope.toolbarOptions.filtersAreActive).toBe(true, "filters should be active to start");
                    expect($scope.toolbarOptions.filtersOpen).toBe(true, "filters should be shown to start");

                    expect($scope.toolbarOptions.sortIsActive).toBe(true, "sort not active after setting to next step");

                    expect($scope.toolbarOptions.sortOptions).toEqual([
                        {
                            title: "Last name",
                            selected: false
                        },
                        {
                            title: "Next step",
                            selected: true
                        }
                    ]);

                    expect($scope.portfolioCount).toBe("My portfolio (2)");
                    expect(controller.data).toEqual({
                        prospects: sortedPrimaryProspects
                    });

                });

            });

        });

        describe("getProspectIdWithSlug", function () {

            var controller;

            beforeEach(function () {

                controller = $controller("ProspectListController", {
                    $scope: $scope,
                    pageTitle: "Title"
                });

            });

            it("works with no parameters", function () {

                var expected, // undefined
                    actual = controller.getProspectIdWithSlug();

                expect(actual).toBe(expected);

            });

            it("works with null", function () {

                var prospect = null,
                    expected, // undefined
                    actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

            it("works with no properties", function () {

                var prospect = {},
                    expected, // undefined
                    actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

            it("works with null properties", function () {

                var prospect,
                    expected = null,
                    actual;

                prospect = {
                    name: null,
                    id: null
                };

                actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

            it("works with blank properties", function () {

                var prospect,
                    expected = "",
                    actual;

                prospect = {
                    name: "",
                    id: ""
                };

                actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

            it("prepends name", function () {

                var prospect,
                    expected = "robert-hernandez-null",
                    actual;

                prospect = {
                    name: "Robert Hernandez",
                    id: null
                };

                actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

            it("appends id", function () {

                var prospect,
                    expected = "38e03170-1019-475b-91ad-ccccf20db107",
                    actual;

                prospect = {
                    name: null,
                    id: "38e03170-1019-475b-91ad-ccccf20db107"
                };

                actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

            it("creates slug", function () {

                var prospect,
                    expected = "robert-hernandez-38e03170-1019-475b-91ad-ccccf20db107",
                    actual;

                prospect = {
                    name: "Robert Hernandez",
                    id: "38e03170-1019-475b-91ad-ccccf20db107"
                };

                actual = controller.getProspectIdWithSlug(prospect);

                expect(actual).toBe(expected);

            });

        });

    });

}());
