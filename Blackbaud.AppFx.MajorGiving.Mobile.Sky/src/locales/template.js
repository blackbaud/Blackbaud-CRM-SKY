/*jshint unused: false */
/*global angular */

(function () {
    'use strict';

    var frogResourcesOverrides,
        skyResourcesOverrides;

    /*LOCALEJSON*/

    angular.module('frog.resources')
        .config(['frogResources', function (frogResources) {
            angular.extend(frogResources, frogResourcesOverrides);
        }]);

    /*LOCALEOVERRIDEJSON*/

    angular.module('sky.resources')
        .config(['bbResources', function (skyResources) {
            angular.extend(skyResources, skyResourcesOverrides);
        }]);


}());