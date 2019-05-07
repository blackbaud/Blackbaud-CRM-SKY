/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    angular.module("frog.frogApi")
        .factory('customizableRoot', ['frogResources', 'prospectUtilities', function (frogResources, prospectUtilities) {
            return {

                getRootFolder: function () {
                    return 'frog';
                },

                isCustomApp: function () {
                    return false;
                },

                getMyPortfolioDatalistId: function () {
                    return 'da329c8b-773c-4501-8329-77047018f6a9'; // FundraiserPortfolio.Mobile.DataList.xml
                },

                categoryRequired: function () {
                    return false;
                },

                getProspectName: function (prospectValues) {
                    return prospectUtilities.getFullName(frogResources, prospectValues[2], prospectValues[1]);
                }
            };
        }]);

}());