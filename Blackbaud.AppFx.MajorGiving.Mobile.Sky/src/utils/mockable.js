/*jshint browser: true */
/*global angular */

(function () {
    'use strict';

    angular.module("frog.util")
    .factory("mockableUtilities", function () {

        /**
         * Get the current window location.
         *
         * This is a function by itself so that we can mock it for unit testing.
         */
        function getWindowLocation() {
            return window.location;
        }

        return {
            getWindowLocation: getWindowLocation
        };

    });

}());