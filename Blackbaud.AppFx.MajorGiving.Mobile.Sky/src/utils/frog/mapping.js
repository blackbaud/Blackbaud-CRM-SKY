/*global angular */

(function () {
    'use strict';

    angular.module("frog.util")
    /**
     * @class frog.util.mapping
     */
    .factory("mapping", [function () {

        var GOOGLE_MAPS_URL = "http://maps.google.com/?q={0}";

        return {
            getMapUrl: function (query) {
                query = query || "";
                query = encodeURIComponent(query);
                return GOOGLE_MAPS_URL.format(query);
            }
        };

    }]);

}());
