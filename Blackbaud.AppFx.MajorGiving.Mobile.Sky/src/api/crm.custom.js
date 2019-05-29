/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

/* This file, meant to be used in tandem with crm.customizable.js, names customizable components within Fundraiser on the Go.
 * Here, specify the desired behavior of properties/functions as you want them to behave in your custom application.
 * The alternate version of the same property/function must appear in crm.customizable.js.
 */
(function () {
    'use strict';

    angular.module("frog.frogApi")
        .factory('customizable', ['customizableRoot', function (customizableRoot) {
            return {

                /**
                 * Gets the name of the application's root folder. Corresponds to customizableRoot.getRootFolder.
                 * 
                 * Do not remove this function.
                 */
                getRootFolder: function () {
                    return 'frogger';
                },

                /**
                 * Gets a value indicating whether or not this is a custom application. Corresponds to customizableRoot.isCustomApp.
                 * 
                 * Do not remove this function.
                 */
                isCustomApp: function () {
                    return true;
                },

                // Add other custom components here.
            };
        }]);

}());