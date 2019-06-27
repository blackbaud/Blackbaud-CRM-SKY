/*global angular */

(function () {
    'use strict';

    function slugFactory() {

        function prependSlug(text, id) {
            if (!angular.isString(text) || text.length === 0) {
                return id;
            }

            var slug = text.toLowerCase();

            if (String.prototype.trim) {
                slug = slug.trim();
            }

            if (slug.lastIndexOf('?') === slug.length - 1) {
                slug = slug.substr(0, slug.length - 1);
            }

            slug = slug.replace(/[^a-zA-Z0-9\-\.\s]/gi, '').replace(/[\s\.]+/gi, '-');

            return slug + '-' + id;
        }

        return {
            prependSlug: prependSlug
        };
    }

    angular.module('frog.util').factory('slug', slugFactory);

}());