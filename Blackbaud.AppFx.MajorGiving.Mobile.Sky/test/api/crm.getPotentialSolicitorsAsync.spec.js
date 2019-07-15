/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getPotentialSolicitorsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            planId,
            potentialSolicitors;

        beforeEach(function () {

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "8A1DE7E9-57B4-400F-ABAB-1F0F7B96B02D") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < potentialSolicitors.length; ++i) {
                                            result.push({
                                                value: potentialSolicitors[i].id,
                                                label: potentialSolicitors[i].name
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

            planId = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";

            potentialSolicitors = [
                {
                    id: "BD0EB2A9-1D7E-4218-8070-21B163EB3A63",
                    name: "Adam Funderburk"
                },
                {
                    id: "94C9CE62-7203-4155-8275-217C361BE60B",
                    name: "Cher"
                }
            ];

        });

        describe("parameters", function () {

            it("error with missing planId", function (done) {

                API.getPotentialSolicitorsAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("planId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with null planId", function (done) {

                planId = null;

                API.getPotentialSolicitorsAsync(planId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("planId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with undefined planId", function (done) {

                planId = undefined;

                API.getPotentialSolicitorsAsync(planId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("planId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with blank planId", function (done) {

                planId = "";

                API.getPotentialSolicitorsAsync(planId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("planId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with non-string planId", function (done) {

                planId = { id: "something" };

                API.getPotentialSolicitorsAsync(planId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("planId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getPotentialSolicitorsAsync(planId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: potentialSolicitors
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

                API.getPotentialSolicitorsAsync(planId)
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

                API.getPotentialSolicitorsAsync(planId)
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

                API.getPotentialSolicitorsAsync(planId)
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

                planId = "bead68f5-c2ae-4bdb-b2f2-b201484c85a4";

                potentialSolicitors = [
                    {
                        id: "bd0eb2a9-1d7e-4218-8070-21b163eb3a63",
                        name: "Adam Funderburk"
                    },
                    {
                        id: "94c9ce62-7203-4155-8275-217c361be60b",
                        name: "Cher"
                    }
                ];

                API.getPotentialSolicitorsAsync(planId)
                    .then(function (response) {
                        potentialSolicitors[0].id = "BD0EB2A9-1D7E-4218-8070-21B163EB3A63";
                        potentialSolicitors[1].id = "94C9CE62-7203-4155-8275-217C361BE60B";

                        expect(response).toEqual({
                            potentialSolicitors: potentialSolicitors
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

                var originalPotentialSolicitors = potentialSolicitors;
                
                API.getPotentialSolicitorsAsync(planId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
                        });

                        potentialSolicitors = [];

                        return API.getPotentialSolicitorsAsync(planId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalPotentialSolicitors = potentialSolicitors;

                API.getPotentialSolicitorsAsync(planId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
                        });

                        response.potentialSolicitors = [];
                        potentialSolicitors = [];

                        return API.getPotentialSolicitorsAsync(planId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
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

                API.getPotentialSolicitorsAsync(planId)
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;
                        
                        return API.getPotentialSolicitorsAsync(planId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: potentialSolicitors
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches based on planId", function (done) {

                var originalPotentialSolicitors = potentialSolicitors;
                
                API.getPotentialSolicitorsAsync(planId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
                        });

                        response.potentialSolicitors = [];
                        potentialSolicitors = [];

                        return API.getPotentialSolicitorsAsync("029236ce-0210-4104-80ed-5c551adc9b27");
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: []
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("cache does not care about planId case", function (done) {

                planId = "bead68f5-c2ae-4bdb-b2f2-b201484c85a4";

                var originalPotentialSolicitors = potentialSolicitors;
                
                API.getPotentialSolicitorsAsync(planId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
                        });

                        potentialSolicitors = [];
                        planId = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";

                        return API.getPotentialSolicitorsAsync(planId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialSolicitors: originalPotentialSolicitors
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
