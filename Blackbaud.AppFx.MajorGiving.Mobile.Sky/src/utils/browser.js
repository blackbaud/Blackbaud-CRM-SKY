/*global angular */

(function () {
    'use strict';

    angular.module("frog.util")
    .factory("browserUtilities", ["mockableUtilities", function (mockableUtilities) {

        /**
         * Get the parameters from the query string.
         *
         * @return {Object}
         */
        function getQueryStringParameters() {

            var queryString;

            queryString = mockableUtilities.getWindowLocation().href.split("?")[1];
            if (queryString) {

                // Normalize to lower case because query string keys are case insensitive.
                queryString = queryString.toLowerCase();

                // from http://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object
                queryString = decodeURI(queryString).replace(/"/g, '\\"');
                queryString = queryString.replace(/&/g, '","');
                queryString = queryString.replace(/=/g, '":"');
                queryString = '{"' + queryString + '"}';

                // TODO this will not always parse properly - you can have a query string that is just a key.
                queryString = JSON.parse(queryString);

            }

            return queryString || {};
        }

        /**
         * Redirect the page.
         *
         * @param {String} redirectUrl
         */
        function redirect(redirectUrl) {
            mockableUtilities.getWindowLocation().replace(redirectUrl);
        }

        return {
            getWindowLocation: mockableUtilities.getWindowLocation,
            getQueryStringParameters: getQueryStringParameters,
            redirect: redirect
        };
    }]);

}());
