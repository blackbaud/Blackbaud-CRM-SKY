/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getStatesListAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            simpleDataListLoadIsSuccessful,
            simpleDataListLoadError,
            countryId,
            states;

        beforeEach(function () {

            module('frog.api');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            simpleDataListLoad: function (simpleDataListId) {

                                if (simpleDataListId === "7FA91401-596C-4F7C-936D-6E41683121D7") {

                                    if (simpleDataListLoadIsSuccessful) {

                                        var result = [],
                                            i;

                                        for (i = 0; i < states.length; ++i) {
                                            result.push({
                                                value: states[i].id,
                                                label: states[i].abbreviation
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
            
            countryId = "D81CEF85-7569-4B2E-8F2E-F7CF998A3342";
            
            states = [
                {
                    id: "CD46EAA2-5A7B-4BB8-B2D4-6FA2F2D6901C",
                    abbreviation: "TN"
                },
                {
                    id: "5B9EB7FE-2A79-4B14-83A0-9C116A548F02",
                    abbreviation: "SC"
                }
            ];

        });

        //start of countryId parameters
        describe("parameters", function () {

            //should pass because null countryId means it will grab default country
            it("has successful results with null countryId", function (done) {

                countryId = null;

                //successful line
                API.getStatesListAsync(countryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            states: states
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);

                $timeout.flush();

            });

        });
        //end of countryId parameters
        describe("general functionality", function () {

            it("success", function (done) {

                API.getStatesListAsync(countryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            states: states
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

                API.getStatesListAsync(countryId)
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

                API.getStatesListAsync(countryId)
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

                API.getStatesListAsync(countryId)
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

                states = [
                    {
                        id: "cd46eaa2-5a7b-4bb8-b2d4-6fa2f2d6901c",
                        abbreviation: "TN"
                    },
                    {
                        id: "5b9eb7fe-2a79-4b14-83a0-9c116a548f02",
                        abbreviation: "SC"
                    }
                ];

                API.getStatesListAsync(countryId)
                    .then(function (response) {
                        states[0].id = "CD46EAA2-5A7B-4BB8-B2D4-6FA2F2D6901C";
                        states[1].id = "5B9EB7FE-2A79-4B14-83A0-9C116A548F02";

                        expect(response).toEqual({
                            states: states
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

                var originalStates = states;
                
                API.getStatesListAsync(countryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            states: originalStates
                        });

                        states = [];

                        return API.getStatesListAsync(countryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            states: originalStates
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalStates = states;

                API.getStatesListAsync(countryId)
                    .then(function (response) {
                        expect(response).toEqual({
                            states: originalStates
                        });

                        response.states = [];
                        states = [];

                        return API.getStatesListAsync(countryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            states: originalStates
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

                API.getStatesListAsync(countryId)
                    .then(function () {
                        fail("successCallback");
                    }, function (error) {
                        expect(error).toEqual({
                            message: "Test error 1"
                        });

                        simpleDataListLoadIsSuccessful = true;

                        return API.getStatesListAsync(countryId);
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            states: states
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
