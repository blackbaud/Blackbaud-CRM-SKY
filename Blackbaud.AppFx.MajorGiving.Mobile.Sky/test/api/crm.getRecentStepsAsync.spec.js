/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getRecentStepsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            dataListLoadIsSuccessful,
            dataListLoadError,
            prospectId,
            steps;
        
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
                            dataListLoad: function (dataListId, contextRecordId, options) {

                                if (dataListId === "580e374a-3d5f-4218-9d39-5d2356e04b42") {

                                    if (dataListLoadIsSuccessful) {

                                        var result = [],
                                            i;
                                        
                                        if (contextRecordId.toUpperCase() === prospectId.toUpperCase()) {
                                            if (!options.parameters) {
                                                for (i = 0; i < steps.length; ++i) {
                                                    result.push({
                                                        values: [
                                                            steps[i].id, // 0: STEPID
                                                            steps[i].contactMethod, // 1: CONTACTMETHOD
                                                            steps[i].objective, // 2: OBJECTIVE
                                                            steps[i].date, // 3: DATE
                                                            steps[i].comments, // 4: COMMENTS
                                                            steps[i].planName, // 5: PLANNAME,
                                                            steps[i].planId //6: PLANID
                                                        ]
                                                    });
                                                }
                                            }
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

            prospectId = "C3FC52B4-B802-4765-936D-4B7BCF7D4DC4";

            var step1,
                step2,
                step3,
                step4,
                step5;

            step1 = {
                id: "E00A6FE3-3750-47D1-8CBF-FBF08A8F744A",
                contactMethod: null,
                objective: "Be steward-y",
                date: bbMoment(),
                comments: null,
                planName: "Robert's Stewardship Plan",
                planId: "E38C9D58-CD39-419D-AF19-C56F172BA315"
            };

            step2 = {
                id: "0A66FECD-A565-4F1C-A844-4337C9FFDE44",
                contactMethod: null,
                objective: "New Building Campaign Marketing Effort #1",
                date: bbMoment().subtract(1, "days"),
                comments: "Mailed",
                planName: null,
                planId: null
            };

            step3 = {
                id: "1506EB5B-9D1A-4637-B480-B6585E69E4A6",
                contactMethod: "Mail",
                objective: "Annual Update Mail",
                date: bbMoment().subtract(2, "days"),
                comments: "Mailed",
                planName: null,
                planId: null
            };

            step4 = {
                id: "75896CDA-5635-4F59-A261-956C476667AA",
                contactMethod: "Meeting",
                objective: "Discuss proposal over coffee",
                date: bbMoment().subtract(25, "days"),
                comments: "Robert was receptive to raising the ask amount by $10k",
                planName: "Robert's Major Giving Plan",
                planId: "ABEA63DE-A38B-49B4-9FC6-9B6AD4428F52"
            };

            step5 = {
                id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                contactMethod: "Email",
                objective: "Email about proposal",
                date: bbMoment().subtract(30, "days"),
                comments: null,
                planName: "Robert's Major Giving Plan",
                planId: "ABEA63DE-A38B-49B4-9FC6-9B6AD4428F52"
            };

            steps = [
                step1,
                step2,
                step3,
                step4,
                step5
            ];

        });

        describe("parameters", function () {

            it("has expected error with missing prospectId", function (done) {
                API.getRecentStepsAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({
                            message: "prospectId is required"
                        });
                    })
                    .finally(done);
                
                $timeout.flush();
            });

            it("has expected error with null prospectId", function (done) {

                prospectId = null;

                API.getRecentStepsAsync()
                    .then(successCallbackFail)
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

                API.getRecentStepsAsync()
                    .then(successCallbackFail)
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

                API.getRecentStepsAsync()
                    .then(successCallbackFail)
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

                API.getRecentStepsAsync()
                    .then(successCallbackFail)
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

                API.getRecentStepsAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            steps: steps
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();

            });

            it("prospectId is properly used to get results", function (done) {

                API.getRecentStepsAsync("E78E9B71-1E1B-4D4E-8D99-F629ACBF61B3")
                    .then(function (response) {
                        expect(response).toEqual({
                            steps: []
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();

            });

            it("options used to filter results", function (done) {

                API.getRecentStepsAsync(prospectId, { parameters: [] })
                    .then(function (response) {
                        expect(response).toEqual({
                            steps: []
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();

            });

            it("data list load failure triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                API.getRecentStepsAsync(prospectId)
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

                API.getRecentStepsAsync(prospectId)
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

                API.getRecentStepsAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("sets IDs to upper case value", function (done) {

                prospectId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

                steps = [
                    {
                        id: "e00a6fe3-3750-47d1-8cbf-fbf08a8f744a",
                        contactMethod: null,
                        objective: "Be steward-y",
                        date: bbMoment(),
                        comments: null,
                        planName: "Robert's Stewardship Plan",
                        planId: "35243c9c-fb88-4e49-be00-3fd63d53b9a5"
                    }
                ];

                API.getRecentStepsAsync(prospectId)
                    .then(function (response) {
                        steps[0].id = steps[0].id.toUpperCase();
                        steps[0].planId = steps[0].planId.toUpperCase();

                        expect(response).toEqual({
                            steps: steps
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();

            });

            it("sets empty Guids to null", function (done) {
                prospectId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

                steps = [
                    {
                        id: "E00A6FE3-3750-47D1-8CBF-FBF08A8F744A",
                        contactMethod: null,
                        objective: "Be steward-y",
                        date: bbMoment(),
                        comments: null,
                        planName: "Robert's Stewardship Plan",
                        planId: "00000000-0000-0000-0000-000000000000"
                    }
                ];

                API.getRecentStepsAsync(prospectId)
                    .then(function (response) {
                        steps[0].planId = null;

                        expect(response).toEqual({
                            steps: steps
                        });
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

        });

    });

}());
