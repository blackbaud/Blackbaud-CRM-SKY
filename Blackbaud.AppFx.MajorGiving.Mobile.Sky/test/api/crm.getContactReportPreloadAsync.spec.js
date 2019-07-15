/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getContactReportPreloadAsync', function () {

        var $q,
            $timeout,
            API,
            dataFormLoadIsSuccessful,
            dataFormLoadError,
            preloadData;

        beforeEach(function () {

            module('sky.moment');

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {
                var bbuiShellService = {
                    create: function () {
                        return {
                            dataFormLoad: function (dataFormId) {
                                if (dataFormId === "8eab8484-8188-4e63-a514-e08bea349a05") {
                                    if (dataFormLoadIsSuccessful) {
                                        var result = [
                                            {
                                                name: "SITEID",
                                                value: preloadData.siteId
                                            },
                                            {
                                                name: "SITEREQUIRED",
                                                value: preloadData.siteRequired
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

        beforeEach(inject(function (_api_, _$q_, _$timeout_) {
            API = _api_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            dataFormLoadIsSuccessful = true;

            dataFormLoadError = {};

            preloadData = {
                siteId: "CCCD8D0F-7C3B-48C5-A121-5C57AE98B5E1",
                siteRequired: true
            };

        });

        describe("general functionality", function () {

            it("data form load failure triggers correct behavior", function (done) {

                dataFormLoadIsSuccessful = false;

                dataFormLoadError = {
                    message: "Test error 1"
                };

                API.getContactReportPreloadAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual(dataFormLoadError);
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("data form load failure with no message triggers correct behavior", function (done) {

                dataFormLoadIsSuccessful = false;

                dataFormLoadError = {};

                API.getContactReportPreloadAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("data form load failure with no error info triggers correct behavior", function (done) {

                dataFormLoadIsSuccessful = false;

                dataFormLoadError = null;

                API.getContactReportPreloadAsync()
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

                preloadData = {
                    siteId: "cccd8d0f-7c3b-48c5-a121-5c57ae98b5e1",
                    siteRequired: true
                };

                API.getContactReportPreloadAsync()
                    .then(function (response) {
                        preloadData.siteId = preloadData.siteId.toUpperCase();
                        expect(response).toEqual(preloadData); 
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("does not error with null IDs", function (done) {

                preloadData.siteId = null;

                API.getContactReportPreloadAsync()
                    .then(function (response) {
                        expect(response).toEqual(preloadData); 
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("turns empty guids for siteId into null", function (done) {
                preloadData.siteId = "00000000-0000-0000-0000-000000000000";

                API.getContactReportPreloadAsync()
                    .then(function (response) {
                        expect(response.siteId).toBe(null); 
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
