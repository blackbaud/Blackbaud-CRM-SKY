/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getSubcategoriesAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            categoryId,
            subcategories;

        beforeEach(function () {

            module('frog.frogApi');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "0EACC39B-07D1-4641-8774-E319559535A7") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < subcategories.length; ++i) {
                                            result.push({
                                                value: subcategories[i].id,
                                                label: subcategories[i].name
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

            categoryId = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";

            subcategories = [
                {
                    id: "CC6CCE78-B83E-4BDE-9A60-A2D9A02BA93A",
                    name: "Subcategory 1a"
                },
                {
                    id: "7EED0E08-88CC-4B05-BFCF-3125C42B8131",
                    name: "Subcategory 1b"
                }
            ];

        });

        describe("parameters", function () {

            it("error with missing categoryId", function (done) {

                API.getSubcategoriesAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: "categoryId is required"});
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with null categoryId", function (done) {

                categoryId = null;

                API.getSubcategoriesAsync(categoryId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: "categoryId is required"});
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("has expected error with undefined categoryId", function (done) {

                categoryId = undefined;

                API.getSubcategoriesAsync(categoryId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: "categoryId is required"});
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("has expected error with blank categoryId", function (done) {

                categoryId = "";

                API.getSubcategoriesAsync(categoryId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: "categoryId is required"});
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("has expected error with non-string categoryId", function (done) {

                categoryId = { id: "something" };

                API.getSubcategoriesAsync(categoryId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: "categoryId is required"});
                    })
                    .finally(done);

                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getSubcategoriesAsync(categoryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: subcategories
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
                
                API.getSubcategoriesAsync(categoryId)
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

                API.getSubcategoriesAsync(categoryId)
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

                API.getSubcategoriesAsync(categoryId)
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

                categoryId = "bead68f5-c2ae-4bdb-b2f2-b201484c85a4";

                subcategories = [
                    {
                        id: "cc6cce78-b83e-4bde-9a60-a2d9a02ba93a",
                        name: "Subcategory 1a"
                    },
                    {
                        id: "7eed0e08-88cc-4b05-bfcf-3125c42b8131",
                        name: "Subcategory 1b"
                    }
                ];

                API.getSubcategoriesAsync(categoryId)
                    .then(function (response) {
                        subcategories[0].id = "CC6CCE78-B83E-4BDE-9A60-A2D9A02BA93A";
                        subcategories[1].id = "7EED0E08-88CC-4B05-BFCF-3125C42B8131";

                        expect(response).toEqual({
                            subcategories: subcategories
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

                var originalSubcategories = subcategories;

                API.getSubcategoriesAsync(categoryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
                        });

                        subcategories = [];

                        return API.getSubcategoriesAsync(categoryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalSubcategories = subcategories;
                
                API.getSubcategoriesAsync(categoryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
                        });

                        response.subcategories = [];
                        subcategories = [];

                        return API.getSubcategoriesAsync(categoryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
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

                API.getSubcategoriesAsync(categoryId)
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;
                        
                        return API.getSubcategoriesAsync(categoryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: subcategories
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("caches based on categoryId", function (done) {

                var originalSubcategories = subcategories;

                API.getSubcategoriesAsync(categoryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
                        });

                        response.subcategories = [];
                        subcategories = [];

                        return API.getSubcategoriesAsync("4c370c82-e95f-41cf-b836-6d66406434d4");
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: []
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("cache does not care about categoryId case", function (done) {

                categoryId = "bead68f5-c2ae-4bdb-b2f2-b201484c85a4";

                var originalSubcategories = subcategories;

                API.getSubcategoriesAsync(categoryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
                        });
                        
                        subcategories = [];
                        categoryId = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";

                        return API.getSubcategoriesAsync(categoryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            subcategories: originalSubcategories
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
