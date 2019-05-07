/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getAdditionalRevenueDetailsAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            dataFormLoadIsSuccessful,
            dataFormLoadError,
            lineItemId,
            details;

        function successCallbackFail() {
            fail("successCallback");
        }

        function failureCallbackFail() {
            fail("failureCallback");
        }

        beforeEach(function () {
            module('frog.frogApi');

            module(function ($provide) {
                bbuiShellService = {
                    create: function () {
                        return {
                            dataFormLoad: function (dataFormId) {
                                if (dataFormId === "aa822383-f32f-4916-95bd-0f4b9a89e4b3") {
                                    if (dataFormLoadIsSuccessful) {
                                        var result = [
                                            {
                                                name: "CURRENCYID",
                                                value: details.currencyId
                                            },
                                            {
                                                name: "CAMPAIGNS",
                                                value: details.campaigns
                                            },
                                            {
                                                name: "REVENUECATEGORY",
                                                value: details.revenueCategory
                                            },
                                            {
                                                name: "SOLICITORSLIST",
                                                value: details.solicitors
                                            },
                                            {
                                                name: "RECOGNITIONSLIST",
                                                value: details.recognitions
                                            },
                                            {
                                                name: "OPPORTUNITY",
                                                value: details.opportunity
                                            },
                                            {
                                                name: "APPLIEDTO",
                                                value: details.appliedTo
                                            },
                                            {
                                                name: "GIFTAIDSTATUS",
                                                value: details.giftAidStatus
                                            },
                                            {
                                                name: "TAXCLAIMELIGIBILITY",
                                                value: details.taxClaimEligibility
                                            },
                                            {
                                                name: "TAXCLAIMAMOUNT",
                                                value: details.taxClaimAmount
                                            }
                                        ];

                                        return $q.resolve({
                                            data: {
                                                values: result
                                            }
                                        });
                                    }

                                    return $q.reject({ data: dataFormLoadError });
                                }

                                fail("Unknown dataFormLoad parameters");
                            }
                        };
                    }
                };

                $provide.service('bbuiShellService', function () {
                    return bbuiShellService;
                });
            });
        });

        beforeEach(inject(function (_api_, _bbMoment_, _infinityUtilities_, _$q_, _$timeout_) {
            API = _api_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {
            dataFormLoadIsSuccessful = true;

            dataFormLoadError = {};

            lineItemId = "FB2B38D7-16F5-445E-90D1-AF7CFBA2FA21";

            details = {
                currencyId: "C87F83DD-A386-4978-A468-929026254160",
                campaigns: "Campaign 1; Campaign 2",
                revenueCategory: "Revenue category",
                solicitors: "Solicitor 1; Solicitor 2",
                recognitions: "Recognition 1; Recognition 2",
                opportunity: "Prospect Amount (Status) - Date",
                appliedTo: "Date Pledge for Name",
                giftAidStatus: "Not qualified",
                taxClaimEligibility: "No valid declaration",
                taxClaimAmount: "0.00"
            };
        });

        describe("parameters", function () {

            it("throws an error with missing lineItemId and failureCallback", function (done) {
                API.getAdditionalRevenueDetailsAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("lineItemId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with null lineItemId", function (done) {
                lineItemId = null;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("lineItemId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with undefined lineItemId", function (done) {
                lineItemId = undefined;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("lineItemId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with blank lineItemId", function (done) {
                lineItemId = "";

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("lineItemId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with non-string lineItemId", function (done) {
                lineItemId = { id: "something" };

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("lineItemId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {
                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("data form load failure triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = {
                    message: "Test error 1"
                };

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual(dataFormLoadError);
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("data form load failure with no message triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = {};

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("data form load failure with no error info triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = null;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("sets ID to upper case value", function (done) {
                details = {
                    currencyId: "c87f83dd-a386-4978-a468-929026254160",
                    campaigns: null,
                    revenueCategory: null,
                    solicitors: null,
                    recognitions: null,
                    opportunity: null,
                    appliedTo: null,
                    giftAidStatus: null,
                    taxClaimEligibility: null,
                    taxClaimAmount: null
                };

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        details.currencyId = details.currencyId.toUpperCase();
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("does not error with null IDs", function (done) {
                details = {
                    currencyId: null,
                    campaigns: null,
                    revenueCategory: null,
                    solicitors: null,
                    recognitions: null,
                    opportunity: null,
                    appliedTo: "Date Pledge for Name",
                    giftAidStatus: null,
                    taxClaimEligibility: null,
                    taxClaimAmount: null
                };

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {
                var originalDetails = details;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);

                        details = { currencyId: "A04D0FFA-61D0-4E1E-BA35-C2C885C27755" };

                        return API.getAdditionalRevenueDetailsAsync(lineItemId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("caches a copy of the results", function (done) {
                var originalDetails = details;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);

                        response.currencyId = "A04D0FFA-61D0-4E1E-BA35-C2C885C27755";
                        details = { currencyId: "68285ED3-7DB3-4D01-9876-5010B28EA773" };

                        return API.getAdditionalRevenueDetailsAsync(lineItemId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("caches based on lineItemId", function (done) {
                var originalDetails = details;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);

                        details = {
                            currencyId: "A04D0FFA-61D0-4E1E-BA35-C2C885C27755",
                            campaigns: null,
                            revenueCategory: null,
                            solicitors: null,
                            recognitions: null,
                            opportunity: null,
                            appliedTo: null,
                            giftAidStatus: null,
                            taxClaimEligibility: null,
                            taxClaimAmount: null
                        };

                        lineItemId = "B0477E2E-564B-4AB6-A1C9-7985E57D721C";

                        return API.getAdditionalRevenueDetailsAsync(lineItemId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("does not cache failure", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = {
                    message: "Test error 1"
                };

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(successCallbackFail, function (error) {
                        expect(error).toEqual(dataFormLoadError);

                        dataFormLoadIsSuccessful = true;

                        return API.getAdditionalRevenueDetailsAsync(lineItemId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(details);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("does not care about lineItemId case", function (done) {
                lineItemId = "fb2b38d7-16f5-445e-90d1-af7cfba2fa21";

                var originalDetails = details;

                API.getAdditionalRevenueDetailsAsync(lineItemId)
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);

                        details = { currencyId: "A04D0FFA-61D0-4E1E-BA35-C2C885C27755" };
                        lineItemId = "FB2B38D7-16F5-445E-90D1-AF7CFBA2FA21";

                        return API.getAdditionalRevenueDetailsAsync(lineItemId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalDetails);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

        });
    });
}());