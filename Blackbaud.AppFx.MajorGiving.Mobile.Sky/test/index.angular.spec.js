/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('index', function () {

        var $rootScope,
            $scope,
            $controller,
            $state,
            $injector,
            $q,
            compileProvider,
            bbWindowConfig,
            Routing,
            userInfo,
            errorInfo,
            authenticateIsSuccessful;

        beforeEach(function () {

            module('frog.resources');

            module('frog.api');

            module(function ($provide) {

                function getDatabaseName() {
                    return "BBInfinityMock";
                }
                
                function initialize() {

                }

                function authenticateAsync(successCallback, failureCallback, finallyCallback) {

                    if (authenticateIsSuccessful) {
                        successCallback(userInfo);
                    } else {
                        failureCallback(errorInfo);
                    }

                    finallyCallback();

                }

                $provide.value("api", {
                    getDatabaseName: getDatabaseName,
                    initialize: initialize,
                    authenticateAsync: authenticateAsync
                });

            });

            module("ng", function ($compileProvider) {
                compileProvider = $compileProvider;
            });

            module('frog');

            module('ui.router');

            module(function ($provide) {

                $provide.value('$stateParams', {
                    prospectId: "robert-hernandez-e7fd541d-55c3-458d-b6d3-a02a8af2975c"
                });

            });

        });

        //Inject objects needed to drive the controller
        beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$injector_, _bbWindowConfig_, _Routing_, _$q_) {

            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $state = _$state_;
            $injector = _$injector_;
            bbWindowConfig = _bbWindowConfig_;
            Routing = _Routing_;
            $q = _$q_;

            $scope = _$rootScope_.$new();

        }));

        beforeEach(function () {

            userInfo = {
                id: "85d75db7-8dc0-4ef1-8d68-280971c93c9d", // app user ID
                isSysAdmin: false,
                inactiveTimeout: 900
            };

            errorInfo = {
                message: "Test error 1"
            };

            authenticateIsSuccessful = true;

        });

        describe("page load", function () {

            it("run sets expected values", function () {

                expect(bbWindowConfig.productName).toBe("frog");

            });

            it("config sets the href whitelist", function () {

                expect(compileProvider.aHrefSanitizationWhitelist()).toEqual(/^\s*(https?|sms|tel|ftp|mailto|tel|local|file|data|blob):/);

            });

        });

        describe("MainController", function () {

            function initializeController() {

                $controller("MainController", {
                    $scope: $scope
                });

            }

            it("controller sets expected values", function () {

                initializeController();

                expect(Routing.active).toBe(false);

            });

            it("authenticate success sets expected values", function () {

                authenticateIsSuccessful = true;

                initializeController();

                expect($scope.sessionInfo).toEqual(userInfo);

            });

            it("authenticate failure sets error message", function () {

                authenticateIsSuccessful = false;

                initializeController();

                expect($scope.startError).toBe("FROG is experiencing technical difficulties. Please try again later. Test error 1");

            });

            it("authenticate failure sets error message with null error", function () {

                authenticateIsSuccessful = false;
                errorInfo = null;

                initializeController();

                expect($scope.startError).toBe("FROG is experiencing technical difficulties. Please try again later. ");

            });

            it("authenticate failure sets error message with null error message", function () {

                authenticateIsSuccessful = false;
                errorInfo = {};

                initializeController();

                expect($scope.startError).toBe("FROG is experiencing technical difficulties. Please try again later. ");

            });

            it("malformed url sets correct error message", function () {

                authenticateIsSuccessful = false;
                errorInfo = new Error("You must either provide a baseUrl and databaseName as parameters or set them globally using bbuiShellServiceConfig.");

                initializeController();

                expect($scope.startError).toBe("An error occurred loading this page.  If you accessed this page from a bookmark, the bookmarked URL may no longer be valid.");

            });

        });

        describe("state", function () {

            describe("prospects", function () {

                it("should respond to URL", function () {

                    expect($state.href("prospects", {})).toEqual('');

                });

            });

            describe("prospects.myportfolio", function () {

                it("should respond to URL", function () {

                    expect($state.href("prospects.myportfolio")).toEqual('/?databaseName=BBInfinityMock');

                });

                it("should resolve data", function () {

                    $state.go("prospects.myportfolio");
                    $rootScope.$digest();
                    expect($state.current.name).toBe("prospects.myportfolio");

                    expect($state.current.views).toBeDefined("$state.current.views");
                    expect($state.current.views).not.toEqual(null, "$state.current.views");

                    var prospectList = $state.current.views[""];
                    expect(prospectList).toBeDefined("prospectList");
                    expect(prospectList).not.toEqual(null, "prospectList");

                    expect($injector.invoke(prospectList.resolve.pageTitle)).toBe("My portfolio");

                });

            });

            describe("prospects.prospect", function () {

                it("should respond to URL", function () {

                    expect($state.href("prospects.prospect",
                        {
                            prospectId: "robert-hernandez-fcf99215-1cc2-41b5-be2d-f51c1433a93d"
                        })).toEqual('/robert-hernandez-fcf99215-1cc2-41b5-be2d-f51c1433a93d?databaseName=BBInfinityMock');

                });

                it("should resolve data", function () {

                    var prospectState = $state.get("prospects.prospect");
                    expect($injector.invoke(prospectState.resolve.prospectId)).toBe("e7fd541d-55c3-458d-b6d3-a02a8af2975c");
                    expect($injector.invoke(prospectState.resolve.prospectIdWithSlug)).toBe("robert-hernandez-e7fd541d-55c3-458d-b6d3-a02a8af2975c");
                    expect($injector.invoke(prospectState.resolve.prospectName)).toBe("robert hernandez");

                });

            });

        });

    });

    // These are tests that need a special mock provider that would cause issues with other tests.
    describe('index', function () {

        var mockCompileProvider;

        beforeEach(function () {

            module("ng", function ($provide, $compileProvider) {

                mockCompileProvider = $compileProvider;

                mockCompileProvider.test_regex = /^\s*(http|https|ftp|mailto|tel|local|file|data|blob):/;

                spyOn(mockCompileProvider, "aHrefSanitizationWhitelist").and.callFake(function (regex) {
                    if (regex) {
                        if (regex.toString().indexOf("(https?|ftp|mailto|tel|local|file|data|blob)") >= 0) {
                            // Something is causing this to be set after we mock the function but before config is called.
                            return;
                        }
                        mockCompileProvider.test_regex = regex;
                    }
                    return mockCompileProvider.test_regex;
                });

            });

            module('frog');

        });

        //Inject objects needed to drive the controller
        beforeEach(inject());

        it("config sets the href whitelist when https? is not found", function () {
            expect(mockCompileProvider.test_regex).toEqual(/^\s*(https?|sms|ftp|mailto|tel|local|file|data|blob):/);
        });

    });

}());
