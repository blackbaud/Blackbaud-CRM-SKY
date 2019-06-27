/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getLocationsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            databaseLocations,
            allLocations;

        beforeEach(function () {

            module('frog.api');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "b0cb4058-4355-431a-abdb-3e9f2be8c918") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        // The simple list does not include the Other option
                                        for (i = 0; i < databaseLocations.length; ++i) {
                                            result.push({
                                                value: databaseLocations[i].id,
                                                label: databaseLocations[i].name
                                            });
                                        }

                                        return $q.resolve({
                                            data: {
                                                rows: result
                                            }
                                        });
                                    }

                                    return $q.reject(simpleDataListLoadError);

                                }

                                fail("Unknown simpleDataListLoad parameters");
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });

            });

        });

        beforeEach(inject(function (_api_, _$q_, _$timeout_) {
            API = _api_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            simpleDataListLoadIsSuccessful = true;

            simpleDataListLoadError = {
                data: {
                    message: "Test error 1"
                }
            };

            // Represents locations that would be in the database
            databaseLocations = [
                {
                    id: "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4",
                    name: "Location 1"
                },
                {
                    id: "3E021D71-26AB-4D1D-B000-9F4C548D1A92",
                    name: "Location 2"
                }
            ];

            // Represents locations that would be output by the simple list.
            // Note the addition of the special Other option.
            allLocations = [
                databaseLocations[0],
                databaseLocations[1],
                {
                    id: "84A394FE-55B8-4737-9B2F-CC478766EC39",
                    name: "Other"
                }
            ];

        });

        describe('general functionality', function () {

            it("success", function (done) {

                API.getLocationsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: allLocations
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("simple data list load failure triggers correct behavior", function (done) {

                simpleDataListLoadIsSuccessful = false;

                API.getLocationsAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("simple data list load failure with no message triggers correct behavior", function (done) {

                simpleDataListLoadIsSuccessful = false;
                simpleDataListLoadError = {};

                API.getLocationsAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("simple data list load failure with no error info triggers correct behavior", function (done) {

                simpleDataListLoadIsSuccessful = false;
                simpleDataListLoadError = null;

                API.getLocationsAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("sets ID to upper case value", function (done) {

                databaseLocations = [
                    {
                        id: "bead68f5-c2ae-4bdb-b2f2-b201484c85a4",
                        name: "Location 1"
                    },
                    {
                        id: "3e021d71-26ab-4d1d-b000-9f4c548d1a92",
                        name: "Location 2"
                    }
                ];

                API.getLocationsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: allLocations
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {

                var originalLocations = allLocations;

                API.getLocationsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: originalLocations
                        });

                        allLocations = [];

                        return API.getLocationsAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: originalLocations
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalLocations = allLocations;

                API.getLocationsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: originalLocations
                        });

                        response.locations = [];
                        allLocations = [];

                        return API.getLocationsAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: originalLocations
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("does not cache failure", function (done) {

                simpleDataListLoadIsSuccessful = false;

                API.getLocationsAsync()
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;

                        return API.getLocationsAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            locations: allLocations
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

        });

    });

}());