﻿/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getCategoriesAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            prospectUtilities,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            planType,
            categories;

        beforeEach(function () {

            module("sky.moment");
            module("frog.resources");

            module('frog.frogApi');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {
                        return {
                            simpleDataListLoad: function (simpleDataListId) {
                                if (simpleDataListId === "CBBA7545-B66F-44AC-AA24-D9C2F8CBC4EC" || simpleDataListId === "4BC0FBBF-F1FD-465D-9B40-FCD3B4E5A335") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < categories.length; ++i) {
                                            result.push({
                                                value: categories[i].id,
                                                label: categories[i].name
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

        beforeEach(inject(function (_api_, _prospectUtilities_, _$q_, _$timeout_) {
            API = _api_;
            prospectUtilities = _prospectUtilities_;
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

            planType = prospectUtilities.PLAN_TYPE.NONE;

            categories = [
                {
                    id: "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4",
                    name: "Category 1"
                },
                {
                    id: "3E021D71-26AB-4D1D-B000-9F4C548D1A92",
                    name: "Category 2"
                }
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getCategoriesAsync(planType)
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: categories
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

                API.getCategoriesAsync(planType)
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

                API.getCategoriesAsync(planType)
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

                API.getCategoriesAsync(planType)
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

                categories = [
                    {
                        id: "bead68f5-c2ae-4bdb-b2f2-b201484c85a4",
                        name: "Category 1"
                    },
                    {
                        id: "3e021d71-26ab-4d1d-b000-9f4c548d1a92",
                        name: "Category 2"
                    }
                ];

                API.getCategoriesAsync(planType)
                    .then(function (response) {
                        categories[0].id = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";
                        categories[1].id = "3E021D71-26AB-4D1D-B000-9F4C548D1A92";

                        expect(response).toEqual({
                            categories: categories
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

                var originalCategories = categories;

                API.getCategoriesAsync(planType)
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: originalCategories
                        });

                        categories = [];

                        return API.getCategoriesAsync(planType);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: originalCategories
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalCategories = categories;

                API.getCategoriesAsync(planType)
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: originalCategories
                        });

                        response.categories = [];
                        categories = [];

                        return API.getCategoriesAsync(planType);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: originalCategories
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

                API.getCategoriesAsync(planType)
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;

                        return API.getCategoriesAsync(planType);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: categories
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("does not return cached interaction categories for stewardship steps", function (done) {

                var originalCategories = categories;

                API.getCategoriesAsync(planType)
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: originalCategories
                        });

                        categories = [];
                        planType = prospectUtilities.PLAN_TYPE.STEWARDSHIP;

                        return API.getCategoriesAsync(planType);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            categories: []
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
