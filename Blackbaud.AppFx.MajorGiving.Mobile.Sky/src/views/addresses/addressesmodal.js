/// <reference path="../../../bower_components/angular/angular.js" />

/* global angular */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('AddressesModalController', AddressesModalController);

    AddressesModalController.$inject = ['$scope', 'frogApi', 'frogResources', '$uibModalInstance', 'options', 'mapping'];

    /**
     * A modal dialog that allows users to view address information of a prospect.
     * 
     * @param {Object} options
     * @param {String} options.prospectId The system ID for the prospect.
     */
    function AddressesModalController($scope, frogApi, frogResources, $uibModalInstance, options, mapping) {

        var locals;

        $scope.frogResources = frogResources;
        $scope.mapping = mapping;
        $scope.locals = locals = {
            loading: true
        };

        function loadAddresses() {
            function loadAddressesSuccess(reply) {
                locals.addresses = reply.addresses;
            }

            function loadAddressesFailure(reply) {
                var message = "";

                if (reply && reply.message) {
                    message = reply.message;
                }

                locals.loadError = frogResources.error_addresses_general.format(message);
            }

            function loadAddressesFinally() {
                locals.loading = false;
            }

            frogApi.getAddressesListAsync(options.prospectId, loadAddressesSuccess, loadAddressesFailure, loadAddressesFinally);
        }

        loadAddresses();
    }

}());
