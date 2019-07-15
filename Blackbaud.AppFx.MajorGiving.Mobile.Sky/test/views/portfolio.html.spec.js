/*jshint jasmine: true */
/*globals module, inject, angular, $, setTimeout */

(function () {
    'use strict';

    var $scope,
        $rootScope,
        $templateCache,
        $compile,
        $q,
        testUtils,
        template = "views/portfolio.html",
        TITLE = "[bb-frog-testid='title']",
        CONTENT = "[bb-frog-testid='content']",
        ERROR = "[bb-frog-testid='error']",
        ERRORMESSAGE = "h2",
        authenticateWait,
        authenticateShouldSucceed,
        authenticateFailureMessage,
        portfolioSettings,
        portfolioSettingsFail;

    function compileFormWithState(controllerState) {
        controllerState = controllerState || {};

        $scope.page = { portfolioActive: true };
        angular.extend($scope.page, controllerState);

        var el = angular.element('<div>' + $templateCache.get(template) + '</div>');
        $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
        $rootScope.$apply();

        // need to append to the body so that elements will be attached to the page dom and have a width etc.
        $('body').append(el);

        return el;
    }

    function checkState(formDOM) {

        testUtils.checkHtml(formDOM);

    }

    beforeEach(function () {

        module("frog.test");
        module("infinity.util");
        module('frog.api');

        module(function ($provide) {

            function getDatabaseName() {
                return "BBInfinityMock";
            }

            function initialize() {

            }

            function authenticateAsync(successCallback, failureCallback, finallyCallback) {

                if (authenticateShouldSucceed) {
                    successCallback({
                        id: "85d75db7-8dc0-4ef1-8d68-280971c93c9d", // app user ID
                        isSysAdmin: false,
                        inactivityTimeout: 900
                    });
                } else {
                    failureCallback({
                        message: authenticateFailureMessage
                    });
                }

                finallyCallback();

            }

            function authenticateAsyncWait(successCallback, failureCallback, finallyCallback) {

                if (authenticateWait) {
                    setTimeout(function () {
                        authenticateAsync(successCallback, failureCallback, finallyCallback);
                    }, authenticateWait);
                } else {
                    authenticateAsync(successCallback, failureCallback, finallyCallback);
                }

            }

            function getPortfolioAsync() {
                return $q.resolve({
                    prospects: [
                        {
                            name: "User One",
                            id: "3dcef174-b025-4619-b3db-79d2d77f3c29"
                        },
                        {
                            name: "User Two",
                            id: "75896cda-5635-4f59-a261-956c476667aa"
                        }
                    ]
                });
            }

            function getPortfolioSettingsAsync(successCallback, failureCallback, finallyCallback) {

                successCallback = successCallback || angular.noop;
                failureCallback = failureCallback || angular.noop;
                finallyCallback = finallyCallback || angular.noop;

                if (portfolioSettingsFail) {
                    failureCallback({
                        message: "Test error 1"
                    });
                } else {
                    successCallback(portfolioSettings);
                }
                finallyCallback();

            }

            function getAuthInterceptors() {
                return [
                    function () {
                        return {
                            "responseError": function (response) {
                                return $q.reject(response);
                            }
                        };
                    }
                ];
            }

            $provide.value("api", {
                getDatabaseName: getDatabaseName,
                initialize: initialize,
                authenticateAsync: authenticateAsyncWait,
                getPortfolioAsync: getPortfolioAsync,
                getPortfolioSettingsAsync: getPortfolioSettingsAsync,
                getAuthInterceptors: getAuthInterceptors
            });

        });

        module("frog");

    });

    beforeEach(inject(function (_$rootScope_, _$templateCache_, _$compile_, _testUtils_, _$q_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        testUtils = _testUtils_;
        $q = _$q_;
    }));

    describe('portfolio html', function () {

        beforeEach(function () {
            authenticateShouldSucceed = true;
            authenticateFailureMessage = null;
            authenticateWait = 0;

            portfolioSettings = {
                onlyPrimary: false
            };
            portfolioSettingsFail = false;

        });

        it('does not load the page until authenticated', function () {

            authenticateWait = 2000;

            var formDOM;

            formDOM = compileFormWithState();

            checkState(formDOM);

            expect(formDOM.find(CONTENT)).not.toExist();
            expect(formDOM.find(TITLE)).not.toExist();
            expect(formDOM.find(ERROR)).not.toExist();

        });

        it('loads the page title properly', function () {

            var formDOM;

            formDOM = compileFormWithState();

            checkState(formDOM);

            expect(formDOM.find(TITLE)).toExist();
            expect(formDOM.find(TITLE)).toBeVisible();
            expect(formDOM.find(TITLE).text()).toContain("My portfolio (2)");

            expect(formDOM.find(CONTENT)).toExist();

            expect(formDOM.find(ERROR)).not.toExist();

        });

        it('loads the page when settings fail', function () {

            portfolioSettingsFail = true;

            var formDOM;

            formDOM = compileFormWithState();

            checkState(formDOM);

            expect(formDOM.find(TITLE)).toExist();
            expect(formDOM.find(TITLE)).toBeVisible();
            expect(formDOM.find(TITLE).text()).toContain("My portfolio (2)");

            expect(formDOM.find(CONTENT)).toExist();

            expect(formDOM.find(ERROR)).not.toExist();

        });

        it('shows a message upon error', function () {

            authenticateShouldSucceed = false;

            var formDOM;

            formDOM = compileFormWithState();

            checkState(formDOM);

            expect(formDOM.find(TITLE)).not.toExist();

            expect(formDOM.find(CONTENT)).not.toExist();

            expect(formDOM.find(ERROR)).toExist();
            expect(formDOM.find(ERRORMESSAGE).text()).toBe("FROG is experiencing technical difficulties. Please try again later. ");

        });

        it('shows a detailed message upon error', function () {

            authenticateShouldSucceed = false;
            authenticateFailureMessage = "Test error 1";

            var formDOM;

            formDOM = compileFormWithState();

            checkState(formDOM);

            expect(formDOM.find(TITLE)).not.toExist();

            expect(formDOM.find(CONTENT)).not.toExist();

            expect(formDOM.find(ERROR)).toExist();
            expect(formDOM.find(ERRORMESSAGE).text()).toBe("FROG is experiencing technical difficulties. Please try again later. Test error 1");

        });

    });

}());
