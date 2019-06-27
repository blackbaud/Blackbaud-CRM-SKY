/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getConstituentSearchListInformationAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            dataFormLoadIsSuccessful,
            dataFormLoadError,
            searchListId,
            information;

        function successCallbackFail() {
            fail("successCallback");
        }

        function failureCallbackFail() {
            fail("failureCallback");
        }

        beforeEach(function () {
            module('frog.api');

            module(function ($provide) {

                var transformOptionalFilterFields;

                transformOptionalFilterFields = function (filterFields) {
                    if (!filterFields || !filterFields.length) {
                        return null;
                    }

                    var result = [];

                    filterFields.forEach(function (filterField) {
                        result.push(
                            [
                                {
                                    name: "FIELDID",
                                    value: filterField.fieldId
                                }
                            ]
                        );
                    });

                    return result;
                };

                bbuiShellService = {
                    create: function () {
                        return {
                            dataFormLoad: function (dataFormId) {
                                if (dataFormId === "48861a67-60fe-4438-b725-0ee3418eebbf") {
                                    if (dataFormLoadIsSuccessful) {
                                        var result = [
                                            {
                                                name: "OPTIONALFILTERFIELDS",
                                                value: transformOptionalFilterFields(information.optionalFilterFields)
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

            searchListId = "FB2B38D7-16F5-445E-90D1-AF7CFBA2FA21";

            information = {
                optionalFilterFields: [
                    {
                        fieldId: "Test Field 1"
                    },
                    {
                        fieldId: "Test Field 2"
                    }
                ]
            };
        });

        describe("parameters", function () {

            it("throws an error with missing searchListId", function (done) {
                API.getConstituentSearchListInformationAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("searchListId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with null searchListId", function (done) {
                searchListId = null;

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("searchListId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with undefined searchListId", function (done) {
                searchListId = undefined;

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("searchListId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with blank searchListId", function (done) {
                searchListId = "";

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("searchListId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("throws error with non-string searchListId", function (done) {
                searchListId = { id: "something" };

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("searchListId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {
                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(function (response) {
                        expect(response).toEqual(information);
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

                API.getConstituentSearchListInformationAsync(searchListId)
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

                API.getConstituentSearchListInformationAsync(searchListId)
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

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({ message: "" });
                    })
                    .finally(done);

                $timeout.flush();
            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {
                var originalInformation = information;

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);

                        information = {
                            optionalFilterFields: [
                                {
                                    fieldId: "Test Field 3"
                                },
                                {
                                    fieldId: "Test Field 4"
                                }
                            ]
                        };

                        return API.getConstituentSearchListInformationAsync(searchListId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("caches a copy of the results", function (done) {
                var originalInformation = information;

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);

                        response.optionalFilterFields = [
                            {
                                fieldId: "Test field 3"
                            }
                        ];
                        
                        information = {
                            optionalFilterFields: [
                                {
                                    fieldId: "Test Field 3"
                                },
                                {
                                    fieldId: "Test Field 4"
                                }
                            ]
                        };

                        return API.getConstituentSearchListInformationAsync(searchListId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("caches based on search list id", function (done) {
                var originalInformation = information;

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);

                        information = {
                            optionalFilterFields: [
                                {
                                    fieldId: "Test Field 3"
                                },
                                {
                                    fieldId: "Test Field 4"
                                }
                            ]
                        };

                        searchListId = "B0477E2E-564B-4AB6-A1C9-7985E57D721C";

                        return API.getConstituentSearchListInformationAsync(searchListId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(information);
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

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(successCallbackFail, function (error) {
                        expect(error).toEqual(dataFormLoadError);

                        dataFormLoadIsSuccessful = true;

                        return API.getConstituentSearchListInformationAsync(searchListId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(information);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("does not care about searchListId case", function (done) {
                searchListId = "fb2b38d7-16f5-445e-90d1-af7cfba2fa21";

                var originalInformation = information;

                API.getConstituentSearchListInformationAsync(searchListId)
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);

                        information = {
                            optionalFilterFields: [
                                {
                                    fieldId: "Test Field 3"
                                },
                                {
                                    fieldId: "Test Field 4"
                                }
                            ]
                        };

                        searchListId = "FB2B38D7-16F5-445E-90D1-AF7CFBA2FA21";

                        return API.getConstituentSearchListInformationAsync(searchListId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalInformation);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

        });
    });
}());