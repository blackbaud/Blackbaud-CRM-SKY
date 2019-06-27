/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getPlanStagesAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            planStages;

        beforeEach(function () {

            module('frog.api');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "48182a32-39ee-454e-87e8-ac6ae255c259") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < planStages.length; ++i) {
                                            result.push({
                                                value: planStages[i].id,
                                                label: planStages[i].name
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

            planStages = [
                {
                    id: "041C928A-5B1B-4101-98E2-4C0C35616CAC",
                    name: "Identification"
                },
                {
                    id: "77C9F91C-F99B-4B41-93F1-F4B7F0B58F63",
                    name: "Cultivation"
                },
                {
                    id: "9F754E2F-F4A9-4242-8A9A-D272483CDE6C",
                    name: "Solicitation"
                },
                {
                    id: "448BE794-F513-4282-9A9C-C004F59B3095",
                    name: "Negotiation"
                }
            ];

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getPlanStagesAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            planStages: planStages
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

                API.getPlanStagesAsync()
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

                API.getPlanStagesAsync()
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

                API.getPlanStagesAsync()
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

                planStages = [
                    {
                        id: "041c928a-5b1b-4101-98e2-4c0c35616cac",
                        name: "Identification"
                    },
                    {
                        id: "77c9f91c-f99b-4b41-93f1-f4b7f0b58f63",
                        name: "Cultivation"
                    },
                    {
                        id: "9f754e2f-f4a9-4242-8a9a-d272483cde6c",
                        name: "Solicitation"
                    },
                    {
                        id: "448be794-f513-4282-9a9c-c004f59b3095",
                        name: "Negotiation"
                    }
                ];

                API.getPlanStagesAsync()
                    .then(function (response) {
                        planStages[0].id = "041C928A-5B1B-4101-98E2-4C0C35616CAC";
                        planStages[1].id = "77C9F91C-F99B-4B41-93F1-F4B7F0B58F63";
                        planStages[2].id = "9F754E2F-F4A9-4242-8A9A-D272483CDE6C";
                        planStages[3].id = "448BE794-F513-4282-9A9C-C004F59B3095";

                        expect(response).toEqual({
                            planStages: planStages
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

                var originalPlanStages = planStages;

                API.getPlanStagesAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            planStages: originalPlanStages
                        });

                        planStages = [];

                        return API.getPlanStagesAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            planStages: originalPlanStages
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalPlanStages = planStages;

                API.getPlanStagesAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            planStages: originalPlanStages
                        });

                        response.planStages = [];
                        planStages = [];

                        return API.getPlanStagesAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            planStages: originalPlanStages
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

                API.getPlanStagesAsync()
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;

                        return API.getPlanStagesAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            planStages: planStages
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
