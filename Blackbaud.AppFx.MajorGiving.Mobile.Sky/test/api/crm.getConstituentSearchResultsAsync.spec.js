/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getConstituentSearchResultsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            dataListLoadIsSuccessful,
            dataListLoadError,
            constituentSearchResults;

        function successCallbackFail() {
            fail("successCallback");
        }

        function failureCallbackFail() {
            fail("failureCallback");
        }

        beforeEach(function () {

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            dataListLoad: function (dataListId, contextRecordId, options) {

                                if (dataListId === "5c14275b-01f7-44ec-9707-e076cea1d361") {

                                    if (dataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        if (!options.parameters) {
                                            for (i = 0; i < constituentSearchResults.length; ++i) {
                                                result.push({
                                                    values: [
                                                        constituentSearchResults[i].id, // 0: ID
                                                        constituentSearchResults[i].fullName, // 1: FULLNAME
                                                        constituentSearchResults[i].city, // 2: CITY
                                                        constituentSearchResults[i].state, // 3: STATE
                                                        constituentSearchResults[i].postCode, // 4: POSTCODE
                                                        constituentSearchResults[i].displayAddress // 5: DISPLAYADDRESS
                                                    ]
                                                });
                                            }
                                        }

                                        return $q.resolve({
                                            data: {
                                                rows: result
                                            }
                                        });
                                    }

                                    return $q.reject(dataListLoadError);
                                }

                                fail("Unknown dataListLoad parameters");
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });

            });

        });

        beforeEach(inject(function (_api_, _bbMoment_, _$q_, _$timeout_) {
            API = _api_;
            bbMoment = _bbMoment_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            dataListLoadIsSuccessful = true;

            dataListLoadError = {
                data: {
                    message: "Test error 1"
                }
            };

            var constituentSearchResult1,
            constituentSearchResult2;

            constituentSearchResult1 = {
                id: "E00A6FE3-3750-47D1-8CBF-FBF08A8F744A",
                fullName: "Donald Duck",
                city: "Orlando",
                state: "FL",
                postCode: "58752",
                displayAddress: true
            };

            constituentSearchResult2 = {
                id: "E00A6FE3-3750-47D1-8CBF-FBF08A8F744A",
                fullName: "Michael Smith",
                city: "Nashville",
                state: "TN",
                postCode: "15888",
                displayAddress: true
            };

            constituentSearchResults = [
                constituentSearchResult1,
                constituentSearchResult2
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getConstituentSearchResultsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            constituentSearchResults: constituentSearchResults
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();

            });

            it("options used to filter results", function (done) {

                API.getConstituentSearchResultsAsync({ parameters: [] })
                    .then(function (response) {
                        expect(response).toEqual({
                            constituentSearchResults: []
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();

            });

            it("data list load failure triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                API.getConstituentSearchResultsAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("data list load failure with no message triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                dataListLoadError = {};

                API.getConstituentSearchResultsAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("data list load failure with no error info triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                dataListLoadError = null;

                API.getConstituentSearchResultsAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("sets IDs to upper case value", function (done) {

                constituentSearchResults = [
                    {
                        id: "e00a6fe3-3750-47d1-8cbf-fbf08a8f744a",
                        fullName: "Michael Smith",
                        city: "Nashville",
                        state: "TN",
                        postCode: "15888",
                        displayAddress: true
                    }
                ];

                API.getConstituentSearchResultsAsync()
                    .then(function (response) {
                        constituentSearchResults[0].id = constituentSearchResults[0].id.toUpperCase();

                        expect(response).toEqual({
                            constituentSearchResults: constituentSearchResults
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();

            });

        });

    });

}());