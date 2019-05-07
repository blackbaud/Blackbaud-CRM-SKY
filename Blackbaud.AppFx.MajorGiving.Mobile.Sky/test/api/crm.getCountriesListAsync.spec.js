/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getCountriesListAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            countries;

        beforeEach(function () {

            module('frog.frogApi');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "C9649672-353D-42E8-8C25-4D34BBABFBBA") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < countries.length; ++i) {
                                            result.push({
                                                value: countries[i].id,
                                                label: countries[i].description
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
            
            countries = [
                {
                    id: "D9EE54CD-2183-490C-A3AD-11152B271335",
                    description: "Canada"
                },
                {
                    id: "D81CEF85-7569-4B2E-8F2E-F7CF998A3342",
                    description: "United States"
                }
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getCountriesListAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            countries: countries
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

                API.getCountriesListAsync()
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

                API.getCountriesListAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: ""});
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("simple data list load failure with no error info triggers correct behavior", function (done) {

                simpleDataListLoadIsSuccessful = false;
                simpleDataListLoadError = null;

                API.getCountriesListAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: ""});
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("sets ID to upper case value", function (done) {

                countries = [
                    {
                        id: "d9ee54cd-2183-490c-a3ad-11152b271335",
                        description: "Canada"
                    },
                    {
                        id: "d81cef85-7569-4b2e-8f2e-f7cf998a3342",
                        description: "United States"
                    }
                ];

                API.getCountriesListAsync()
                    .then(function (response) {
                        countries[0].id = "D9EE54CD-2183-490C-A3AD-11152B271335";
                        countries[1].id = "D81CEF85-7569-4B2E-8F2E-F7CF998A3342";

                        expect(response).toEqual({
                            countries: countries
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

                var originalCountries = countries;
                
                API.getCountriesListAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            countries: originalCountries
                        });

                        countries = [];

                        return API.getCountriesListAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            countries: originalCountries
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalCountries = countries;

                API.getCountriesListAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            countries: originalCountries
                        });

                        response.countries = [];
                        countries = [];

                        return API.getCountriesListAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            countries: originalCountries
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

                API.getCountriesListAsync()
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;

                        return API.getCountriesListAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            countries: countries
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
