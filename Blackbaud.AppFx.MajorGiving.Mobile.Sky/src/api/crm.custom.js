/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    angular.module("frog.frogApi")
        .factory('customizable', ['customizableRoot', 'apiContactReportOptions', function (customizableRoot, apiContactReportOptions) {
            return {

                // getRootFolder: customizableRoot.getRootFolder,
                getRootFolder: function () {
                    return 'frogger';
                },

                // isCustomApp: customizableRoot.isCustomApp,
                isCustomApp: function () {
                    return true;
                },

                // getMyPortfolioDatalistId: customizableRoot.getMyPortfolioDatalistId,
                getMyPortfolioDatalistId: function () {
                    return '021dfdcb-c901-4a72-8b4c-7cea05d6d01b'; // CustomPortfolio.DataList.xml
                },

                // categoryRequired: customizableRoot.categoryRequired,
                categoryRequired: function (selectedStatus, currentPlanType) {
                    if (selectedStatus === apiContactReportOptions.getCompletedStatusCode(currentPlanType)) {
                        return true;
                    }
                    return false;
                },

                // getProspectName: customizableRoot.getProspectName
                getProspectName: function (prospectValues) {
                    return prospectValues[1] + ' - ' + prospectValues[2];
                }
            };
        }]);
    
}());