/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    angular.module("frog.api")

        .factory("api", ["infinityUtilities", "infinityAuth", "apiPortfolio", "apiProspectView", "apiContactReportOptions", "apiContactReport", "infinityProduct", 'customizable',
            function (infinityUtilities, infinityAuth, apiPortfolio, apiProspectView, apiContactReportOptions, apiContactReport, infinityProduct, customizable) {

                function initialize() {
                    infinityUtilities.initialize(customizable.getRootFolder(), customizable.isCustomApp());
                }

                return {
                    getDatabaseName: infinityUtilities.getDatabaseName,
                    initialize: initialize,
                    authenticateAsync: infinityAuth.authenticateAsync,
                    logoutAsync: infinityAuth.logoutAsync,
                    getPortfolioAsync: apiPortfolio.getPortfolioAsync,
                    getPortfolioSettingsAsync: apiPortfolio.getPortfolioSettingsAsync,
                    getConstituentSearchListInformationAsync: apiPortfolio.getConstituentSearchListInformationAsync,
                    getProspectInfoAsync: apiProspectView.getProspectInfoAsync,
                    getProspectSummaryAsync: apiProspectView.getProspectSummaryAsync,
                    getRecentStepsAsync: apiProspectView.getRecentStepsAsync,
                    getConstituentSearchResultsAsync: apiPortfolio.getConstituentSearchResultsAsync,
                    getCountriesListAsync: apiPortfolio.getCountriesListAsync,
                    getStatesListAsync: apiPortfolio.getStatesListAsync,
                    getDefaultCountryAsync: apiPortfolio.getDefaultCountryAsync,
                    getCountryFormatsAsync: apiPortfolio.getCountryFormatsAsync,
                    getRecentGiftsAndCreditsAsync: apiProspectView.getRecentGiftsAndCreditsAsync,
                    getAddressesListAsync: apiProspectView.getAddressesListAsync,
                    getAdditionalRevenueDetailsAsync: apiProspectView.getAdditionalRevenueDetailsAsync,
                    getContactMethodsAsync: apiContactReportOptions.getContactMethodsAsync,
                    getPlanStagesAsync: apiContactReportOptions.getPlanStagesAsync,
                    getCategoriesAsync: apiContactReportOptions.getCategoriesAsync,
                    getSubcategoriesAsync: apiContactReportOptions.getSubcategoriesAsync,
                    getLocationsAsync: apiContactReportOptions.getLocationsAsync,
                    getPotentialParticipantsAsync: apiContactReportOptions.getPotentialParticipantsAsync,
                    getPotentialSolicitorsAsync: apiContactReportOptions.getPotentialSolicitorsAsync,
                    getSitesAsync: apiContactReportOptions.getSitesAsync,
                    getPlansAsync: apiContactReportOptions.getPlansAsync,
                    getStatusCodesAsync: apiContactReportOptions.getStatusCodesAsync,
                    getCompletedStatusCode: apiContactReportOptions.getCompletedStatusCode,
                    loadStepAsync: apiContactReport.loadStepAsync,
                    addStepAsync: apiContactReport.addStepAsync,
                    editStepAsync: apiContactReport.editStepAsync,
                    getContactReportPreloadAsync: apiContactReport.getContactReportPreloadAsync,
                    productIsInstalledAsync: infinityProduct.productIsInstalledAsync,
                    getAuthInterceptors: infinityAuth.getAuthInterceptors
                };

            }
        ]);

}());
