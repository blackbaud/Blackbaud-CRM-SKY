/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getContactMethodsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            contactMethods;

        beforeEach(function () {

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "a89a4f2b-76f2-43fa-8abc-ae0e84d2d64e") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < contactMethods.length; ++i) {
                                            result.push({
                                                value: contactMethods[i].id,
                                                label: contactMethods[i].name
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

            contactMethods = [
                {
                    id: "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4",
                    name: "Contact Method 1"
                },
                {
                    id: "3E021D71-26AB-4D1D-B000-9F4C548D1A92",
                    name: "Contact Method 2"
                }
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getContactMethodsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            contactMethods: contactMethods
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

                API.getContactMethodsAsync()
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

                API.getContactMethodsAsync()
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

                API.getContactMethodsAsync()
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

                contactMethods = [
                    {
                        id: "bead68f5-c2ae-4bdb-b2f2-b201484c85a4",
                        name: "Contact Method 1"
                    },
                    {
                        id: "3e021d71-26ab-4d1d-b000-9f4c548d1a92",
                        name: "Contact Method 2"
                    }
                ];

                API.getContactMethodsAsync()
                    .then(function (response) {
                        contactMethods[0].id = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";
                        contactMethods[1].id = "3E021D71-26AB-4D1D-B000-9F4C548D1A92";

                        expect(response).toEqual({
                            contactMethods: contactMethods
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

                var originalContactMethods = contactMethods;
                
                API.getContactMethodsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            contactMethods: originalContactMethods
                        });

                        contactMethods = [];

                        return API.getContactMethodsAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            contactMethods: originalContactMethods
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalContactMethods = contactMethods;

                API.getContactMethodsAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            contactMethods: originalContactMethods
                        });

                        response.contactMethods = [];
                        contactMethods = [];

                        return API.getContactMethodsAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            contactMethods: originalContactMethods
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

                API.getContactMethodsAsync()
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;

                        return API.getContactMethodsAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            contactMethods: contactMethods
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
