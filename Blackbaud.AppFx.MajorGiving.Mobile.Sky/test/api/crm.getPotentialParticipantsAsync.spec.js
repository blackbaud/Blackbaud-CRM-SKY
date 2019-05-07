/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getPotentialParticipantsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            dataListLoadIsSuccessful,
            dataListLoadError,
            prospectId,
            potentialParticipants;

        beforeEach(function () {

            module('frog.frogApi');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {
                        return {
                            dataListLoad: function (dataListId) {
                                if (dataListId === "21c66a32-5acd-4329-aa8e-9e3b0f6d2e9b") {
                                    if (dataListLoadIsSuccessful) {
                                        var result = [];

                                        potentialParticipants.forEach(function (participant) {
                                            var names = participant.name.split(" ");

                                            result.push({
                                                values: [
                                                    participant.id,
                                                    names[0],
                                                    names[1]
                                                ]
                                            });
                                        });

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

        beforeEach(inject(function (_api_, _$q_, _$timeout_) {
            API = _api_;
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

            potentialParticipants = [
                {
                    id: "D445A2C7-F7DF-447C-9FB9-C946541CC8B9",
                    name: "Robert Hernandez"
                },
                {
                    id: "532EE023-CA42-4C7C-8E39-4D8C76308D0E",
                    name: "Wendy Hernandez"
                }
            ];

        });

        describe("parameters", function () {

            it("error with missing prospectId", function (done) {

                API.getPotentialParticipantsAsync()
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);
                
                $timeout.flush();
            });

            it("has expected error with null prospectId", function (done) {

                prospectId = null;

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with undefined prospectId", function (done) {

                prospectId = undefined;

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with blank prospectId", function (done) {

                prospectId = "";

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("has expected error with non-string prospectId", function (done) {

                prospectId = { id: "something" };

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("success", function (done) {

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: potentialParticipants
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("data list load failure triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;

                API.getPotentialParticipantsAsync(prospectId)
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

            it("data list load failure with no message triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;
                dataListLoadError = {};

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({message: ""});
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("data list load failure with no error info triggers correct behavior", function (done) {

                dataListLoadIsSuccessful = false;
                dataListLoadError = null;

                API.getPotentialParticipantsAsync(prospectId)
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

                prospectId = "bead68f5-c2ae-4bdb-b2f2-b201484c85a4";

                potentialParticipants = [
                    {
                        id: "d445a2c7-f7df-447c-9fb9-c946541cc8b9",
                        name: "Robert Hernandez"
                    },
                    {
                        id: "532ee023-ca42-4c7c-8e39-4d8c76308d0e",
                        name: "Wendy Hernandez"
                    }
                ];

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function (response) {
                        potentialParticipants[0].id = "D445A2C7-F7DF-447C-9FB9-C946541CC8B9";
                        potentialParticipants[1].id = "532EE023-CA42-4C7C-8E39-4D8C76308D0E";

                        expect(response).toEqual({
                            potentialParticipants: potentialParticipants
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

                var originalPotentialParticipants = potentialParticipants;

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
                        });

                        potentialParticipants = [];

                        return API.getPotentialParticipantsAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalPotentialParticipants = potentialParticipants;
                
                API.getPotentialParticipantsAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
                        });

                        response.potentialParticipants = [];
                        potentialParticipants = [];

                        return API.getPotentialParticipantsAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
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

                API.getPotentialParticipantsAsync(prospectId)
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        dataListLoadIsSuccessful = true;

                        return API.getPotentialParticipantsAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: potentialParticipants
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches based on prospectId", function (done) {

                var originalPotentialParticipants = potentialParticipants;
                
                API.getPotentialParticipantsAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
                        });

                        response.potentialParticipants = [];
                        potentialParticipants = [];

                        return API.getPotentialParticipantsAsync("95e03fec-22a3-45d5-ae17-acbf92936346");
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: []
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("cache does not care about prospectId case", function (done) {

                prospectId = "ca1c8cd0-1780-49c7-bd04-4110357bf5e0";

                var originalPotentialParticipants = potentialParticipants;
                
                API.getPotentialParticipantsAsync(prospectId)
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
                        });

                        potentialParticipants = [];
                        prospectId = "CA1C8CD0-1780-49C7-BD04-4110357BF5E0";

                        return API.getPotentialParticipantsAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            potentialParticipants: originalPotentialParticipants
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
