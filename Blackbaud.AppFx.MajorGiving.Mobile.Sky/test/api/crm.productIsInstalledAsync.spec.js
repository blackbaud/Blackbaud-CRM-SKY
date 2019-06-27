// NOTE: $timeout.flush must be called to resolve the promises so that the done callback will be invoked.

/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api productIsInstalledAsync', function () {

        var bbuiShellService,
            API,
            $q,
            $timeout,
            dataListLoadIsSuccessful,
            dataListLoadError,
            productFlagIds,
            ProductFlagId1 = "39875817-a3f5-448a-b973-69fc713db88e",
            ProductFlagId2 = "e00a72e9-7f35-4e1a-8f03-1306297e390f";

        beforeEach(function () {

            module('frog.api');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            dataListLoad: function (dataListId) {

                                return $q(function (resolve, reject) {
                                    if (dataListId === "c495bc28-db3a-48dc-a980-259b0a0b08c1") {
                                        if (dataListLoadIsSuccessful) {
                                            var result = [],
                                                i;

                                            for (i = 0; i < productFlagIds.length; ++i) {
                                                result.push({
                                                    values: [
                                                        productFlagIds[i]
                                                    ]
                                                });
                                            }

                                            resolve({
                                                data: {
                                                    rows: result
                                                }
                                            });
                                        } else {
                                            reject(dataListLoadError);
                                        }
                                    } else {
                                        reject({ message: "Unknown dataListLoad parameters" });
                                    }
                                });
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

            productFlagIds = [
                ProductFlagId1,
                ProductFlagId2
            ];

        });

        describe("parameters", function () {

            it("fails when no product flag Id is passed in", function (done) {
                API.productIsInstalledAsync()
                    .then(function () {
                        fail("Should have failed with no product flag Id.");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "productId is required." });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("fails when productId is not of type string", function (done) {
                API.productIsInstalledAsync(5)
                    .then(function () {
                        fail("Should have failed with incorrect product flag Id type.");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "productId is required." });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("fails with null product flag Id", function (done) {
                API.productIsInstalledAsync(null)
                    .then(function () {
                        fail("Should have failed with incorrect product flag Id type.");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "productId is required." });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("fails with undefined product flag Id", function (done) {
                API.productIsInstalledAsync(undefined)
                    .then(function () {
                        fail("Should have failed with incorrect product flag Id type.");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "productId is required." });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("fails with blank product flag Id", function (done) {
                API.productIsInstalledAsync("")
                    .then(function () {
                        fail("Should have failed with incorrect product flag Id type.");
                    })
                    .catch(function (error) {
                        expect(error).toEqual({ message: "productId is required." });
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("properly handles data list load failure", function (done) {
                dataListLoadIsSuccessful = false;

                API.productIsInstalledAsync(ProductFlagId1)
                    .then(function () {
                        fail("Data list load should have failed.");
                    })
                    .catch(function (error) {
                        expect(error).toEqual(dataListLoadError.data);
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("successfully finds product", function (done) {
                API.productIsInstalledAsync(ProductFlagId2)
                    .then(function (result) {
                        expect(result).toBe(true);
                    })
                    .catch(function () {
                        fail("Error should not have occurred.");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("does not find product", function (done) {
                API.productIsInstalledAsync("A")
                    .then(function (result) {
                        expect(result).toBe(false);
                    })
                    .catch(function () {
                        fail("Error should not have occurred.");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("caches results of data list", function (done) {
                API.productIsInstalledAsync(ProductFlagId1);
                $timeout.flush();

                productFlagIds = [];

                API.productIsInstalledAsync(ProductFlagId1)
                    .then(function (result) {
                        expect(result).toBe(true);
                    })
                    .catch(function () {
                        fail("Error should not have occurred.");
                    })
                    .finally(done);

                $timeout.flush();
            });

        });

    });

})();
