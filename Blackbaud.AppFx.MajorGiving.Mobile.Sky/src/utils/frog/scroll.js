/*jslint browser: true */
/*global angular, $ */

/**
 * Keep the scroll position when using forward and back buttons.
 * 
 * Adapted from http://stackoverflow.com/a/25073496/1600655.
 */

(function () {
    "use strict";

    function keepScrollPos($state, $window, $timeout, $location, $anchorScroll) {

        // cache scroll position of each route's templateUrl
        var scrollPosCache = {};

        function pageIsWaiting() {
            return $(document.body).data("bb-wait-showingwait") || false;
        }

        function scrollAfterPageLoads() {

            var prevScrollPos = scrollPosCache[$state.current.templateUrl + ":" + $location.url()] || [0, 0];

            if ($window.pageXOffset === prevScrollPos[0] && $window.pageYOffset === prevScrollPos[1]) {
                return;
            }

            if (prevScrollPos[0] === 0 && prevScrollPos[1] === 0) {
                // Timeout is required for iOS.
                $window.setTimeout(function () {
                    $window.scrollTo(0, 0);
                }, 0);
                return;
            }

            if (pageIsWaiting()) {
                $timeout(scrollAfterPageLoads, 50);
                return;
            }

            // Timeout is required for iOS.
            $window.setTimeout(function () {
                $window.scrollTo(prevScrollPos[0], prevScrollPos[1]);
            }, 0);

        }

        // compile function
        return function (scope) {

            scope.$on('$stateChangeStart', function () {
                if ($state.current) {
                    scrollPosCache[$state.current.templateUrl + ":" + $location.url()] = [$window.pageXOffset, $window.pageYOffset];
                }
            });

            scope.$on('$stateChangeSuccess', function () {
                // if hash is specified explicitly, it trumps previously stored scroll position
                if ($location.hash()) {
                    $anchorScroll();

                    // else get previous scroll position; if none, scroll to the top of the page
                } else {
                    scrollAfterPageLoads();
                }
            });
        };
    }

    keepScrollPos.$inject = ['$state', '$window', '$timeout', '$location', '$anchorScroll'];

    angular.module("frog.util")
    .directive("keepScrollPos", keepScrollPos);

}());
