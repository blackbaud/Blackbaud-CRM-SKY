/*jshint unused:false */
/*global angular, console */

// http://stackoverflow.com/questions/20745761/what-is-the-angular-ui-router-lifecycle-for-debugging-silent-errors/20786262#20786262

(function () {
    'use strict';

    angular.module("Debugging", [])
    .factory("Routing", ["$rootScope", function ($rootScope) {
        var handler = { active: false };
        handler.toggle = function () {
            handler.active = !handler.active;
        };
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (handler.active) {
                console.log("$stateChangeStart to " + toState.to + " - fired when the transition begins.");
                console.log("event, toState, toParams, fromState, fromParams");
                console.log(arguments);
            }
        });
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
            if (handler.active) {
                console.log("$stateChangeError - fired when an error occurs during transition.");
                console.log("event, toState, toParams, fromState, fromParams, error");
                console.log(arguments);
            }
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (handler.active) {
                console.log("$stateChangeSuccess to " + toState.name + " - fired once the state transition is complete.");
                console.log("event, toState, toParams, fromState, fromParams");
                console.log(arguments);
            }
        });
        $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
            if (handler.active) {
                console.log("$viewContentLoading - view begins loading - dom not rendered");
                console.log("event, viewConfig");
                console.log(arguments);
            }
        });
        $rootScope.$on('$viewContentLoaded', function (event) {
            if (handler.active) {
                console.log("$viewContentLoaded - fired after dom rendered");
                console.log("event");
                console.log(arguments);
            }
        });
        $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
            if (handler.active) {
                console.log("$stateNotFound " + unfoundState.to + " - fired when a state cannot be found by its name.");
                console.log("event, unfoundState, fromState, fromParams");
                console.log(arguments);
            }
        });
        return handler;
    }]);

}());