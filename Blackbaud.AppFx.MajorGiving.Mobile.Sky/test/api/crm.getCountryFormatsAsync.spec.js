/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getCountryFormatsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            dataListLoadIsSuccessful,
            dataListLoadError,
            formats;

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
                            dataListLoad: function (dataListId) {

                                if (dataListId === "6fcbb42d-a009-493d-82b2-7b73b85649d2") {

                                    if (dataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < formats.length; ++i) {
                                            result.push({
                                                values: [
                                                    formats[i].id, // 0: ID
                                                    formats[i].city, // 1: CITY
                                                    formats[i].state, // 2: STATE
                                                    formats[i].postCode // 3: POSTCODE
                                                ]
                                            });
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

            var country1,
                country2;

            country1 = {
                id: "D81CEF85-7569-4B2E-8F2E-F7CF998A3342",
                city: "City",
                state: "State",
                postCode: "PostCode"
            };

            country2 = {
                id: "D9EE54CD-2183-490C-A3AD-11152B271335",
                city: "City",
                state: "Province",
                postCode: "Postal Code"
            };

            formats = [
                country1,
                country2
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getCountryFormatsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            formats: formats
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();

            });

            it("data list load failure triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                API.getCountryFormatsAsync()
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

                API.getCountryFormatsAsync()
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

                API.getCountryFormatsAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("sets IDs to upper case value", function (done) {

                formats = [
                    {
                        id: "d81cef85-7569-4b2e-8f2e-f7cf998a3342",
                        city: "City",
                        state: "State",
                        postCode: "PostCode"
                    }
                ];

                API.getCountryFormatsAsync()
                    .then(function (response) {
                        formats[0].id = formats[0].id.toUpperCase();

                        expect(response).toEqual({
                            formats: formats
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();

            });
        });

    });

}());
