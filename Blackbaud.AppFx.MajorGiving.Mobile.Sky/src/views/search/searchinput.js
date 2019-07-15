/// <reference path="../../../bower_components/angular/angular.js" />

/* global angular */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('SearchInputController', SearchInputController)
        .directive("searchDisabled", function () { // This directive helps disable the search button if no values are entered into the input fields.
            return function (scope, element, attrs) {
                scope.$watch(attrs.searchDisabled, function (val) {
                    if (val) {
                        element.removeAttr("disabled");
                    } else {
                        element.attr("disabled", "disabled");
                    }
                });
            };
        });

    SearchInputController.$inject = ['$scope', 'api', 'frogResources', 'bbuiShellService', 'slug', '$state', 'searchStorage'];

    /**
     * The controller for the prospect search screen. This allows search information to be entered and used to find prospects.
     */
    function SearchInputController($scope, api, frogResources, bbuiShellService, slug, $state, searchStorage) {

        var self = this,
            onlyPrimaryAddress = false,
            locals;

        $scope.locals = locals = {
            loading: false
        };

        // Search will be disabled if no input values are there
        $scope.searchDisabled = false;
        $scope.frogResources = frogResources;
        $scope.$state = $state;

        // Set ng-if for show input to T/F depending on what was last viewed
        $scope.showInput = searchStorage.showInput;

        // Get array of prospects previously searched in case view is of search results
        self.prospects = searchStorage.prospects;

        // Input fields for controller can be fetched from search module
        $scope.input = searchStorage.savedInput;

        // Load countries and states list
        $scope.locals.countries = loadCountries();
        $scope.locals.states = loadStates();

        // Load search list information to determine if optional fields are enabled
        locals.showCountryField = false;
        locals.showPhoneNumberField = false;
        api.getConstituentSearchListInformationAsync("23c5c603-d7d8-4106-aecc-65392b563887")
            .then(function (response) {
                if (response && response.optionalFilterFields) {
                    response.optionalFilterFields.forEach(function (field) {
                        if (field.fieldId === "COUNTRYID") {
                            locals.showCountryField = true;
                        }

                        if (field.fieldId === "PHONENUMBER") {
                            locals.showPhoneNumberField = true;
                        }
                    });
                }
            })
            .catch(function (error) {
                var message = frogResources.error_search_general.format(error.message);
                locals.loadError = self.loadError = message;
            });

        // Get default country
        locals.cityLabel = frogResources.city;
        locals.stateLabel = frogResources.state;
        locals.postCodeLabel = frogResources.zip_code;
        getDefaultCountry();

        function constituentSearchAll() {
            locals.loading = true;

            // If state or country have been changed to blank or null in the drop-down, reset value to undefined
            if ($scope.input.countryId === null) {
                $scope.input.countryId = undefined;
            }
            if ($scope.input.stateId === null) {
                $scope.input.stateId = undefined;
                loadStates();
            }

            onlyPrimaryAddress = lookOnlyForPrimary();

            var options = {
                parameters: [
                    {
                        id: "FIRSTNAME",
                        value: ($scope.input.firstName === undefined) ? "" : $scope.input.firstName
                    },
                    {
                        id: "KEYNAME",
                        value: ($scope.input.keyName === undefined) ? "" : $scope.input.keyName
                    },
                    {
                        id: "CITY",
                        value: ($scope.input.city === undefined) ? "" : $scope.input.city
                    },
                    {
                        id: "STATEID",
                        value: ($scope.input.stateId === undefined) ? "" : $scope.input.stateId
                    },
                    {
                        id: "POSTCODE",
                        value: ($scope.input.postCode === undefined) ? "" : $scope.input.postCode
                    },
                    {
                        id: "ONLYPRIMARYADDRESS",
                        value: (onlyPrimaryAddress) ? true : false
                    },
                    {
                        id: "COUNTRYID",
                        value: ($scope.input.countryId === undefined) ? "" : $scope.input.countryId
                    },
                    {
                        id: "PHONENUMBER",
                        value: ($scope.input.phoneNumber === undefined) ? "" : $scope.input.phoneNumber
                    }
                ]
            };

            api.getConstituentSearchResultsAsync(options)
                .then(function (response) {
                    self.prospects = searchStorage.prospects = response.constituentSearchResults;
                })
                .catch(function (error) {
                    var message = frogResources.error_search_general.format(error.message);
                    locals.loadError = self.loadError = message;
                })
                .finally(function () {
                    locals.loading = false;
                });
        }

        // Navigate to prospect page
        self.getProspectIdWithSlug = function (prospect) {
            prospect = prospect || {};
            return slug.prependSlug(prospect.name, prospect.id);
        };

        self.goToInput = function () {
            searchStorage.showInput = $scope.showInput = true;

            // If going back to input, current search results can be cleared
            self.prospects = searchStorage.prospects = [];
        };

        self.goToSearchResults = function () {
            searchStorage.showInput = $scope.showInput = false;

            // Store values in search module
            searchStorage.savedInput = $scope.input;

            // Call search constituents using input
            constituentSearchAll();
        };

        $scope.clearFields = function () {
            // Clear input values of controller
            $scope.input = {};

            // Clear input values of search module
            searchStorage.savedInput = {};

            // Grab default country labels again
            getDefaultCountry();
        };

        // Watch input fields for change and save in storage in order to return to them
        $scope.$watch('input', function () {
            searchStorage.savedInput = $scope.input;
        });

        // Get states based on the country
        $scope.$watch("input.countryId", function (newValue) {
            // If new value, reset the states so we don't have invalid values. If null set to undefined and reset states
            if (newValue === null) {
                $scope.input.countryId = undefined;
                locals.states = [];
                getDefaultCountry();
            } else if (newValue !== null) {
                api.getStatesListAsync(newValue)
                    .then(function (response) {
                        locals.states = response.states;
                    })
                    .finally();
                getCountryAddressCaptions(newValue);
            }
        });

        function loadStates() {

            api.getStatesListAsync($scope.input.countryId)
                .then(function (response) {
                    locals.states = response.states;

                })
                .finally();
        }

        function loadCountries() {

            api.getCountriesListAsync()
                .then(function (response) {
                    locals.countries = response.countries;
                })
                .finally();
        }

        function getCountryAddressCaptions(countryId) {
            for (var i = 0; i < locals.countryFormats.length; i++) {
                if (locals.countryFormats[i].id.toUpperCase() === countryId.toUpperCase()) {
                    locals.cityLabel = locals.countryFormats[i].city;
                    locals.stateLabel = locals.countryFormats[i].state;
                    locals.postCodeLabel = locals.countryFormats[i].postCode;

                }
            }
        }

        function loadCountryFormats(countryId) {

            api.getCountryFormatsAsync()

                .then(function (response) {
                    var formats = [];

                    response.formats.forEach(function (format) {
                        formats.push({
                            id: format.id.toUpperCase(),
                            city: format.city,
                            state: format.state,
                            postCode: format.postCode
                        });
                    });
                    locals.countryFormats = formats;
                })
                .then(function () {
                    getCountryAddressCaptions(countryId);

                })
                .finally();
        }

        function getDefaultCountry() {

            api.getDefaultCountryAsync()
                .then(function (response) {
                    locals.defaultCountryId = response.countryId;
                })
                .then(function () {
                    loadCountryFormats(locals.defaultCountryId);
                })
                .finally();
        }

        function lookOnlyForPrimary() {
            // We want to display only the primary address for a prospect with more than 1 address.
            // If just the name is entered, display only the primary. If the name and an address are entered, display the prospect once with that address.
            if (($scope.input.countryId || $scope.input.phoneNumber) && !($scope.input.city || $scope.input.stateId || $scope.input.postCode || $scope.input.firstName || $scope.input.keyName)) {
                return true;
            } else if (($scope.input.firstName || $scope.input.keyName) && ($scope.input.city || $scope.input.stateId || $scope.input.postCode || $scope.input.countryId || $scope.input.phoneNumber)) {
                return false;
            } else if (!$scope.input.firstName && !$scope.input.keyName) {
                return false;
            } else {
                return true;
            }
        }
    }
}());
