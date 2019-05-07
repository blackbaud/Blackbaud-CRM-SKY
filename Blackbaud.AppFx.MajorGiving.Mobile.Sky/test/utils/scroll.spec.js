/*jshint jasmine: true */
/*globals module, inject, angular, $ */

(function () {
    'use strict';

    describe('utils.scroll', function () {

        var $compile,
            $scope,
            $state,
            $timeout,
            timeoutFlush,
            $window,
            $location,
            bbWait,
            $controller,
            el,
            currentUrl,
            currentHash;

        function setInitialPage(templateUrl, url, hash) {

            $state.current.templateUrl = templateUrl;
            currentUrl = url;
            currentHash = hash;

        }

        function changePage(newTemplateUrl, newUrl, newHash) {

            $scope.$broadcast("$stateChangeStart");

            $state.current.templateUrl = newTemplateUrl;
            currentUrl = newUrl;
            currentHash = newHash;

            $scope.$broadcast("$stateChangeSuccess");

            $timeout.flush();

        }

        function pageWait(begin) {
            if (begin) {
                $scope.scrollTestController.beginPageWait();
            } else {
                $scope.scrollTestController.endPageWait();
            }
            $timeout.flush();
        }

        function elementWait(begin) {
            if (begin) {
                $scope.scrollTestController.beginElWait(el);
            } else {
                $scope.scrollTestController.endElWait(el);
            }
            $timeout.flush();
        }

        beforeEach(function () {

            module("frog.test");

            module("ui.router");
            module("sky.wait.factory");
            module("frog.util");

            module(function ($provide) {
                $window = {
                    document: {
                        getElementById: function (id) {
                            
                            var x,
                                y;

                            switch (id) {
                                case "#something1":
                                    x = y = 123;
                                    break;
                                case "#something2":
                                    x = y = 321;
                                    break;
                            }

                            return {
                                scrollIntoView: function () {
                                    $window.scrollTo(x, y);
                                }
                            };
                        }
                    },
                    setTimeout: function (fn) {
                        fn();
                    }
                };
                $provide.value('$window', $window);
            });

            angular.module("frog.test")
                .controller("ScrollTestController", ["bbWait", "$scope", function (bbWait, $scope) {

                    $scope.scrollTestController = {};

                    $scope.scrollTestController.beginPageWait = function () {
                        bbWait.beginPageWait();
                    };

                    $scope.scrollTestController.endPageWait = function () {
                        bbWait.endPageWait();
                    };

                    $scope.scrollTestController.beginElWait = function (element) {
                        bbWait.beginElWait(element);
                    };

                    $scope.scrollTestController.endElWait = function (element) {
                        bbWait.endElWait(element);
                    };

                    $scope.scrollTestController.beginPageWait();

                }]);

            module("frog.test");

        });

        beforeEach(inject(function (_$rootScope_, _$compile_, _$state_, _$timeout_, _$window_, _$location_, _bbWait_, _$controller_) {

            $compile = _$compile_;
            $scope = _$rootScope_;
            $state = _$state_;
            bbWait = _bbWait_;
            $controller = _$controller_;

            $timeout = _$timeout_;
            timeoutFlush = $timeout.flush;
            $timeout.flush = function () {
                try {
                    timeoutFlush();
                } catch (ex) {

                }
            };

            $window = _$window_;
            $window.pageXOffset = 0;
            $window.pageYOffset = 0;
            $window.scrollTo = function (x, y) {
                $window.pageXOffset = x;
                $window.pageYOffset = y;
            };

            $location = _$location_;
            $location.url = function () {
                return currentUrl;
            };
            $location.hash = function () {
                return currentHash;
            };

        }));

        beforeEach(function () {

            currentUrl = "index.html";
            currentHash = null;

            $controller("ScrollTestController", {
                $scope: $scope
            });

            var el = angular.element('<div><bb-page><div ui-view keep-scroll-pos></div></bb-page></div>');
            $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
            $scope.$apply();

            // need to append to the body so that elements will be attached to the page dom and have a width etc.
            $('body').append(el);

            $scope.$digest();

        });

        it("caches correctly when coming from a state that has no templateUrl", function () {

            pageWait();

            setInitialPage(undefined, "index.html");

            $window.scrollTo(10, 100);

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change.");

            changePage(undefined, "index.html");

            expect($window.pageXOffset).toBe(10, "Page should scroll to previous location after going back.");
            expect($window.pageYOffset).toBe(100, "Page should scroll to previous location after going back.");

        });

        it("does not cause a scroll event when scrolling to the same location", function () {

            pageWait();

            spyOn($window, "scrollTo").and.callThrough();

            setInitialPage("page1.html", "/page1/1234");

            expect($window.scrollTo.calls.count()).toBe(0);

            $window.scrollTo(10, 100);

            expect($window.scrollTo.calls.count()).toBe(1);

            changePage("page1.html", "/page1/5678");

            expect($window.scrollTo.calls.count()).toBe(2);

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change.");

            $window.scrollTo(10, 100);

            expect($window.scrollTo.calls.count()).toBe(3);

            changePage("page1.html", "/page1/1234");

            expect($window.scrollTo.calls.count()).toBe(3);

            expect($window.pageXOffset).toBe(10, "Page should scroll to previous location after going back.");
            expect($window.pageYOffset).toBe(100, "Page should scroll to previous location after going back.");

        });

        it("caches correctly when going to the same page with a different id", function () {

            pageWait();

            setInitialPage("page1.html", "/page1/1234");

            $window.scrollTo(10, 100);

            changePage("page1.html", "/page1/5678");

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change.");

            $window.scrollTo(45, 30);

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(10, "Page should scroll to previous location after going back.");
            expect($window.pageYOffset).toBe(100, "Page should scroll to previous location after going back.");

            $window.scrollTo(32, 99);

            changePage("page1.html", "/page1/5678");

            expect($window.pageXOffset).toBe(45, "Page should scroll to previous location after going forward.");
            expect($window.pageYOffset).toBe(30, "Page should scroll to previous location after going forward.");

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(32, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(99, "Page should scroll to top left after page change.");

        });

        it("hash causes proper scroll behavior", function () {

            pageWait();

            setInitialPage("page1.html", "/page1/1234");

            $window.scrollTo(10, 100);

            changePage("page1.html", "/page1/1234", "#something1");

            expect($window.pageXOffset).toBe(123, "Page should scroll to hash location.");
            expect($window.pageYOffset).toBe(123, "Page should scroll to hash location.");

            $window.scrollTo(20, 200);

            changePage("page1.html", "/page1/5678", "#something2");

            expect($window.pageXOffset).toBe(321, "Page should scroll to hash location after page change.");
            expect($window.pageYOffset).toBe(321, "Page should scroll to hash location after page change.");

            changePage("page1.html", "/page1/1234", "#something1");

            expect($window.pageXOffset).toBe(123, "Page should scroll to hash location after page change.");
            expect($window.pageYOffset).toBe(123, "Page should scroll to hash location after page change.");

            changePage("page1.html", "/page1/5678");

            expect($window.pageXOffset).toBe(321, "Page should scroll to previous location after going back.");
            expect($window.pageYOffset).toBe(321, "Page should scroll to previous location after going back.");

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(123, "Page should scroll to previous location after going back.");
            expect($window.pageYOffset).toBe(123, "Page should scroll to previous location after going back.");

        });

        it("scrolls after the page wait ends", function () {

            setInitialPage(undefined, "index.html");

            pageWait(false);

            $window.scrollTo(10, 100);

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change.");

            pageWait(true);
            changePage(undefined, "index.html");

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change when waiting.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change when waiting.");

            pageWait(false);

            expect($window.pageXOffset).toBe(10, "Page should scroll to previous location after wait ends.");
            expect($window.pageYOffset).toBe(100, "Page should scroll to previous location after wait ends.");

        });

        it("is not affected by non-blocking wait", function () {

            pageWait();

            setInitialPage(undefined, "index.html");

            $window.scrollTo(10, 100);

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change.");

            elementWait(true);
            changePage(undefined, "index.html");

            expect($window.pageXOffset).toBe(10, "Page should scroll to previous location with element wait.");
            expect($window.pageYOffset).toBe(100, "Page should scroll to previous location with element wait.");

        });

        it("does not cause a scroll event when you navigate to another page before the page wait ends", function () {

            // Open index, not waiting
            // Scroll to 10,100
            // Navigate to page1, not waiting
            // Scroll to 20,100
            // Navigate to index, waiting
            // Navigate to page1
            // Expect window position 20,100

            setInitialPage(undefined, "index.html");

            pageWait(false);

            $window.scrollTo(10, 100);

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(0, "Page should scroll to top left after page change.");
            expect($window.pageYOffset).toBe(0, "Page should scroll to top left after page change.");

            $window.scrollTo(20, 100);

            pageWait(true);
            changePage(undefined, "index.html");

            expect($window.pageXOffset).toBe(20, "Page should not change scroll after page change when waiting.");
            expect($window.pageYOffset).toBe(100, "Page should not change scroll after page change when waiting.");

            changePage("page1.html", "/page1/1234");

            expect($window.pageXOffset).toBe(20, "Page should not change scroll after page change when waiting.");
            expect($window.pageYOffset).toBe(100, "Page should not change scroll after page change when waiting.");

            pageWait(false);

            expect($window.pageXOffset).toBe(20, "Page should scroll to previous location after wait ends.");
            expect($window.pageYOffset).toBe(100, "Page should scroll to previous location after wait ends.");

        });

    });

}());
