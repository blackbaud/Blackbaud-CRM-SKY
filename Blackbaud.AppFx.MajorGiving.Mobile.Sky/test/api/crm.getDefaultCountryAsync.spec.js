/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getDefaultCountryAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            dataFormLoadIsSuccessful,
            dataFormLoadError,
            details;

        function successCallbackFail() {
            fail("successCallback");
        }

        function failureCallbackFail() {
            fail("failureCallback");
        }

        beforeEach(function () {

            module('frog.api');

            module(function ($provide) {
                bbuiShellService = {
                    create: function () {
                        return {
                            dataFormLoad: function (dataFormId) {
                                if (dataFormId === "679f844a-8cda-4180-83bc-3353d78a5aaf") {
                                    if (dataFormLoadIsSuccessful) {
                                        var result = [
                                            {
                                                name: "COUNTRYID",
                                                value: details.countryId
                                            }
                                        ];
                                        return $q.resolve({
                                            data: {
                                                values: result
                                            }
                                        });
                                    }

                                    return $q.reject({ data: dataFormLoadError });
                                }

                                fail("Unknown dataFormLoad parameters");
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });
            });
        });

        beforeEach(inject(function (_api_, _bbMoment_, _infinityUtilities_, _$q_, _$timeout_) {
            API = _api_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {
            dataFormLoadIsSuccessful = true;

            dataFormLoadError = {};

            details = {
                countryId: "D81CEF85-7569-4B2E-8F2E-F7CF998A3342"
            };
        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {
                API.getDefaultCountryAsync()
                .then(function (response) {
                    expect(response).toEqual(details);
                })
                .catch(failureCallbackFail)
                .finally(done);

                $timeout.flush();
            });

            it("data form load failure triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = {
                    message: "Test error 1"
                };

                API.getDefaultCountryAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual(dataFormLoadError);
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("data form load failure with no message triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = {};

                API.getDefaultCountryAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("data form load failure with no error info triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = null;

                API.getDefaultCountryAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("sets ID to upper case value", function (done) {
                details = {
                    countryId: "d81cef85-7569-4b23-8f2e-f7cf998a3342"
                };

                API.getDefaultCountryAsync()
                    .then(function (response) {
                        details.countryId = details.countryId.toUpperCase();
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("does not error with null IDs", function (done) {
                details = {
                    countryId: null
                };

                API.getDefaultCountryAsync()
                    .then(function (response) {
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

        });
    });
}());