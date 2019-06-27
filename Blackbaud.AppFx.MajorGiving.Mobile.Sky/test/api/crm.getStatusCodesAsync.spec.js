/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getStatusCodesAsync', function () {

        var statusCodes,
            planType,
            API,
            prospectUtilities,
            $timeout;

        beforeEach(function () {
            module('frog.api');
        });

        beforeEach(inject(function (_api_, _prospectUtilities_, _$timeout_) {
            API = _api_;
            prospectUtilities = _prospectUtilities_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            planType = prospectUtilities.PLAN_TYPE.NONE;

            statusCodes = [
                {
                    value: 1,
                    label: "Pending"
                },
                {
                    value: 2,
                    label: "Completed"
                },
                {
                    value: 4,
                    label: "Canceled"
                },
                {
                    value: 5,
                    label: "Declined"
                }
            ];

        });

        describe("parameters", function () {

            it("works with no parameters", function (done) {

                API.getStatusCodesAsync()
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

        });

        describe("general functionality", function () {

            it("returns prospect plan step status codes correctly", function (done) {

                planType = prospectUtilities.PLAN_TYPE.PROSPECT;

                statusCodes = [
                    {
                        value: 0,
                        label: "Planned"
                    },
                    {
                        value: 1,
                        label: "Pending"
                    },
                    {
                        value: 2,
                        label: "Completed"
                    }
                ];

                API.getStatusCodesAsync(planType)
                    .then(function (response) {
                        expect(response).toEqual({
                            statusCodes: statusCodes
                        });
                    })
                    .catch(function () {
                        fail("failureCallback");
                    })
                    .finally(done);
                
                $timeout.flush();

            });

            it("returns stewardship plan step status codes correctly", function (done) {

                planType = prospectUtilities.PLAN_TYPE.STEWARDSHIP;

                statusCodes = [
                    {
                        value: 0,
                        label: "Pending"
                    },
                    {
                        value: 1,
                        label: "Completed"
                    }
                ];

                API.getStatusCodesAsync(planType)
                    .then(function (response) {
                        expect(response).toEqual({
                            statusCodes: statusCodes
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
