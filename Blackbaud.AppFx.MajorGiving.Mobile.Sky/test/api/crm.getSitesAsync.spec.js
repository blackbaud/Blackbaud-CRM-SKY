/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getSitesAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            sites;

        beforeEach(function () {

            module("sky.moment");
            module("frog.resources");

            module('frog.api');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "C8E8D3BA-2725-421f-A796-E2FCC1202780") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < sites.length; ++i) {
                                            result.push({
                                                value: sites[i].id,
                                                label: sites[i].name
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

            sites = [
                {
                    id: "09263E96-974C-49AE-936C-F8463A134ADC",
                    name: "Law School"
                },
                {
                    id: "DE57478D-07F8-4210-B304-7CC13435FE64",
                    name: "College of Business"
                }
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getSitesAsync()
                    .then(function (data) {
                        expect(data).toEqual({
                            sites: sites
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
                
                API.getSitesAsync()
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

                API.getSitesAsync()
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
                
                API.getSitesAsync()
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

                sites = [
                    {
                        id: "09263e96-974c-49ae-936c-f8463a134adc",
                        name: "Law School"
                    },
                    {
                        id: "de57478d-07f8-4210-b304-7cc13435fe64",
                        name: "College of Business"
                    }
                ];

                API.getSitesAsync()
                    .then(function (data) {
                        sites[0].id = "09263E96-974C-49AE-936C-F8463A134ADC";
                        sites[1].id = "DE57478D-07F8-4210-B304-7CC13435FE64";
                        expect(data).toEqual({
                            sites: sites
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

                var originalSites = sites;

                API.getSitesAsync()
                    .then(function (data) {
                        expect(data).toEqual({
                            sites: originalSites
                        });

                        sites = [];

                        return API.getSitesAsync();
                    })
                    .then(function (data) {
                        expect(data).toEqual({
                            sites: originalSites
                        });
                    })
                    .catch(function () {
                        fail("Get sites failed.");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalSites = sites;
                
                API.getSitesAsync()
                    .then(function (data) {
                        expect(data).toEqual({
                            sites: originalSites
                        });
                        
                        data.sites = [];
                        sites = [];

                        return API.getSitesAsync();
                    })
                    .then(function (data) {
                        expect(data).toEqual({
                            sites: originalSites
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

                API.getSitesAsync()
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;
                        return API.getSitesAsync();
                    })
                    .then(function (data) {
                        expect(data).toEqual({
                            sites: sites
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
