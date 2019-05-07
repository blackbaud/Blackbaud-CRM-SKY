/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getPlansAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            prospectUtilities,
            dataListLoadIsSuccessful,
            dataListLoadError,
            prospectId,
            plans;

        beforeEach(function () {

            module('frog.frogApi');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            dataListLoad: function (dataListId) {

                                if (dataListId === "2696ec4c-34df-4922-b0ac-4b57acc14e28") {

                                    if (dataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < plans.length; ++i) {
                                            result.push({
                                                values: [
                                                    plans[i].id,
                                                    plans[i].name,
                                                    (plans[i].planType - 1).toLocaleString()
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

            dataListLoadIsSuccessful = true;

            dataListLoadError = {
                data: {
                    message: "Test error 1"
                }
            };

            prospectId = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";

            plans = [
                {
                    id: "05356428-4AAE-45FD-8A99-9F51BB67065B",
                    name: "Kyle's Planned giving plan",
                    planType: prospectUtilities.PLAN_TYPE.PROSPECT
                },
                {
                    id: "6EEC50CB-5B2A-477C-86A9-F2DDAE976DD1",
                    name: "Kyle's Stewardship Plan",
                    planType: prospectUtilities.PLAN_TYPE.STEWARDSHIP
                }
            ];

        });

        describe("parameters", function () {
            
            it("has expected error with null prospectId", function (done) {

                prospectId = null;

                API.getPlansAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "prospectId is required"
                        });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("has expected error with undefined prospectId", function (done) {

                prospectId = undefined;

                API.getPlansAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "prospectId is required"
                        });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("has expected error with blank prospectId", function (done) {

                prospectId = "";

                API.getPlansAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "prospectId is required"
                        });
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("has expected error with non-string prospectId", function (done) {

                prospectId = { id: "something" };

                API.getPlansAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "prospectId is required"
                        });
                    })
                    .finally(done);

                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getPlansAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: plans
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

            it("simple data list load failure triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                API.getPlansAsync(prospectId)
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

                dataListLoadIsSuccessful = false;
                dataListLoadError = {};

                API.getPlansAsync(prospectId)
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

                dataListLoadIsSuccessful = false;
                dataListLoadError = null;

                API.getPlansAsync(prospectId)
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

                plans = [
                    {
                        id: "05356428-4aae-45fd-8a99-9f51bb67065b",
                        name: "Kyle's Planned giving plan",
                        planType: prospectUtilities.PLAN_TYPE.PROSPECT
                    },
                    {
                        id: "6eec50cb-5b2a-477c-86a9-f2ddae976dd1",
                        name: "Kyle's Stewardship Plan",
                        planType: prospectUtilities.PLAN_TYPE.STEWARDSHIP
                    }
                ];

                API.getPlansAsync(prospectId)
                    .then(function (response) {
                        plans[0].id = "05356428-4AAE-45FD-8A99-9F51BB67065B";
                        plans[1].id = "6EEC50CB-5B2A-477C-86A9-F2DDAE976DD1";
                        expect(response).toEqual({
                            plans: plans
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

                var originalPlans = plans;

                API.getPlansAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
                        });

                        plans = [];

                        return API.getPlansAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalPlans = plans;

                API.getPlansAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
                        });

                        response.plans = [];
                        plans = [];

                        return API.getPlansAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("does not cache failure", function (done) {

                dataListLoadIsSuccessful = false;

                API.getPlansAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        dataListLoadIsSuccessful = true;

                        return API.getPlansAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: plans
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches based on prospectId", function (done) {

                var originalPlans = plans;

                API.getPlansAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
                        });

                        response.plans = [];
                        plans = [];

                        return API.getPlansAsync("95e03fec-22a3-45d5-ae17-acbf92936346");
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: []
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("cache does not care about prospectId case", function (done) {

                prospectId = "bead68f5-c2ae-4bdb-b2f2-b201484c85a4";

                var originalPlans = plans;

                API.getPlansAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
                        });

                        plans = [];
                        prospectId = "BEAD68F5-C2AE-4BDB-B2F2-B201484C85A4";

                        return API.getPlansAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            plans: originalPlans
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
