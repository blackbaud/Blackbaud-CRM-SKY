/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getProspectInfoAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            infinityUtils,
            dataFormLoadIsSuccessful,
            dataFormLoadError,
            prospectId,
            prospect;
        
        function successCallbackFail() {
            fail("successCallback");
        }

        function failureCallbackFail() {
            fail("failureCallback");
        }

        function transformProspect(toTransform) {

            toTransform = toTransform || prospect;

            if (toTransform.primaryBusinessId === "00000000-0000-0000-0000-000000000000") {
                toTransform.primaryBusinessId = null;
            }

            if (toTransform.spouseLastName) {
                if (toTransform.spouseFirstName) {
                    toTransform.spouseName = toTransform.spouseFirstName + " " + toTransform.spouseLastName;
                } else {
                    toTransform.spouseName = toTransform.spouseLastName;
                }
            }

            delete toTransform.spouseFirstName;
            delete toTransform.spouseLastName;

            if (toTransform.primaryMemberKeyName) {
                if (toTransform.primaryMemberFirstName) {
                    toTransform.primaryMemberName = toTransform.primaryMemberFirstName + " " + toTransform.primaryMemberKeyName;
                } else {
                    toTransform.primaryMemberName = toTransform.primaryMemberKeyName;
                }
            }

            delete toTransform.primaryMemberFirstName;
            delete toTransform.primaryMemberKeyName;

            if (toTransform.prospectManagerKeyName) {
                if (toTransform.prospectManagerFirstName) {
                    toTransform.prospectManagerName = toTransform.prospectManagerFirstName + " " + toTransform.prospectManagerKeyName;
                } else {
                    toTransform.prospectManagerName = toTransform.prospectManagerKeyName;
                }
            }

            delete toTransform.prospectManagerFirstName;
            delete toTransform.prospectManagerKeyName;

            toTransform.phoneNumbers = toTransform.phoneNumbers || [];
            toTransform.phoneNumbers.forEach(function (phone) {
                phone.type = phone.type || "";
            });

            toTransform.emailAddresses = toTransform.emailAddresses || [];
            toTransform.emailAddresses.forEach(function (email) {
                email.type = email.type || "";
            });

            toTransform.nextStepTime = infinityUtils.convertHourMinute(toTransform.nextStepTime);

            if (toTransform.nextStepId === "00000000-0000-0000-0000-000000000000") {
                toTransform.nextStepId = null;
            } 
        }

        beforeEach(function () {

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {

                var transformPhones,
                    transformEmails;

                transformPhones = function (phones) {

                    if (!phones || !phones.length) {
                        return null;
                    }

                    var result = [];

                    phones.forEach(function (phone) {

                        var phoneDfi = [
                            {
                                name: "PHONENUMBER",
                                value: phone.number
                            },
                            {
                                name: "PHONETYPE",
                                value: phone.type || ""
                            }
                        ];

                        if (phone.confidential !== undefined) {
                            phoneDfi.push({
                                name: "ISCONFIDENTIAL",
                                value: phone.confidential
                            });
                        }

                        result.push(phoneDfi);
                    });

                    return result;

                };

                transformEmails = function (emails) {

                    if (!emails || !emails.length) {
                        return null;
                    }

                    var result = [];

                    emails.forEach(function (email) {
                        result.push(
                            [
                                {
                                    name: "EMAILADDRESS",
                                    value: email.address
                                },
                                {
                                    name: "EMAILTYPE",
                                    value: email.type || ""
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

                                if (dataFormId === "b0ba1b14-97f7-46d3-b211-ebfa3a783909") {

                                    if (dataFormLoadIsSuccessful) {

                                        var result = [
                                            {
                                                name: "DISPLAYNAME",
                                                value: prospect.displayName
                                            },
                                            {
                                                name: "FIRSTNAME",
                                                value: prospect.firstName
                                            },
                                            {
                                                name: "KEYNAME",
                                                value: prospect.keyName
                                            },
                                            {
                                                name: "PICTURETHUMBNAIL",
                                                value: prospect.pictureThumbnail
                                            },
                                            {
                                                name: "DECEASED",
                                                value: prospect.deceased
                                            },
                                            {
                                                name: "ISINACTIVE",
                                                value: prospect.inactive
                                            },
                                            {
                                                name: "PHONENUMBERS",
                                                value: transformPhones(prospect.phoneNumbers)
                                            },
                                            {
                                                name: "EMAILADDRESSES",
                                                value: transformEmails(prospect.emailAddresses)
                                            },
                                            {
                                                name: "JOBTITLE",
                                                value: prospect.jobTitle
                                            },
                                            {
                                                name: "PRIMARYBUSINESSID",
                                                value: prospect.primaryBusinessId
                                            },
                                            {
                                                name: "PRIMARYBUSINESSNAME",
                                                value: prospect.primaryBusinessName
                                            },
                                            {
                                                name: "SPOUSEID",
                                                value: prospect.spouseId
                                            },
                                            {
                                                name: "SPOUSEFIRSTNAME",
                                                value: prospect.spouseFirstName
                                            },
                                            {
                                                name: "SPOUSELASTNAME",
                                                value: prospect.spouseLastName
                                            },
                                            {
                                                name: "SPOUSEDECEASED",
                                                value: prospect.spouseDeceased
                                            },
                                            {
                                                name: "NEXTSTEPPLANID",
                                                value: prospect.nextStepPlanId
                                            },
                                            {
                                                name: "NEXTSTEPPLANNAME",
                                                value: prospect.nextStepPlanName
                                            },
                                            {
                                                name: "NEXTSTEPCONTACTMETHODID",
                                                value: prospect.nextStepContactMethodId
                                            },
                                            {
                                                name: "NEXTSTEPCONTACTMETHOD",
                                                value: prospect.nextStepContactMethod
                                            },
                                            {
                                                name: "NEXTSTEPOBJECTIVE",
                                                value: prospect.nextStepObjective
                                            },
                                            {
                                                name: "NEXTSTEPLOCATION",
                                                value: prospect.nextStepLocation
                                            },
                                            {
                                                name: "NEXTSTEPDATE",
                                                value: prospect.nextStepDate
                                            },
                                            {
                                                name: "NEXTSTEPTIME",
                                                value: prospect.nextStepTime
                                            },
                                            {
                                                name: "NEXTSTEPID",
                                                value: prospect.nextStepId
                                            },
                                            {
                                                name: "NEXTSTEPCOMMENTS",
                                                value: prospect.nextStepComments
                                            },
                                            {
                                                name: "PROSPECTMANAGERFIRSTNAME",
                                                value: prospect.prospectManagerFirstName
                                            },
                                            {
                                                name: "PROSPECTMANAGERKEYNAME",
                                                value: prospect.prospectManagerKeyName
                                            },
                                            {
                                                name: "PROSPECTMANAGERID",
                                                value: prospect.prospectManagerId
                                            },
                                            {
                                                name: "PRIMARYMEMBERID",
                                                value: prospect.primaryMemberId
                                            },
                                            {
                                                name: "PRIMARYMEMBERFIRSTNAME",
                                                value: prospect.primaryMemberFirstName
                                            },
                                            {
                                                name: "PRIMARYMEMBERKEYNAME",
                                                value: prospect.primaryMemberKeyName
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
            bbMoment = _bbMoment_;
            infinityUtils = _infinityUtilities_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            dataFormLoadIsSuccessful = true;

            dataFormLoadError = {};

            prospectId = "5D01292A-D400-4D06-8848-70561D71DE9E";

            prospect = {
                displayName: "Dr. Robert Hernandez, Class of 1990",
                firstName: "Robert",
                keyName: "Hernandez",
                pictureThumbnail: "",
                deceased: false,
                inactive: false,
                phoneNumbers: [
                    {
                        number: "843-555-1234"
                    },
                    {
                        number: "843-555-5678",
                        type: "Home",
                        confidential: true
                    }
                ],
                emailAddresses: [
                    {
                        address: "bob.hernandez@gmail.com"
                    },
                    {
                        address: "bob.hernandez@blackbaud.com",
                        type: "Work"
                    }
                ],
                jobTitle: "CEO",
                primaryBusinessId: "9460C844-8E34-4B21-B7F7-0FB00539BC02",
                primaryBusinessName: "Barkbaud",
                spouseId: "3FA192CE-988D-459D-BE73-97771F4C084B",
                spouseFirstName: "Wendy",
                spouseLastName: "Hernandez",
                spouseDeceased: false,
                nextStepPlanId: "A2A39C22-E116-4B10-A26C-07CA6D65C293",
                nextStepPlanName: "My Prospect Plan Name",
                nextStepContactMethodId: "7F328525-3A25-4749-A60A-75119C4BEB9F",
                nextStepContactMethod: "In Person",
                nextStepObjective: "Coffee",
                nextStepLocation: "Starbucks on Main",
                nextStepDate: bbMoment().format("YYYY/MM/DDT00:00:00"),
                nextStepTime: "1100",
                nextStepId: "C8AD2FF3-8E29-4186-86A5-7A2C77C7ADCE",
                nextStepComments: "No comment.",
                prospectManagerFirstName: "Henry",
                prospectManagerKeyName: "Higgins",
                prospectManagerId: "43EED8CB-8A0E-4BEA-85E1-72005D574EEC",
                primaryMemberId: "39910DD7-6195-4D61-8B62-3966E4A7E3F4",
                primaryMemberFirstName: "Laura",
                primaryMemberKeyName: "Holt",
                prospectFullName: "Robert Hernandez"

            };

        });

        describe("parameters", function () {

            it("throws error with missing prospectId and failureCallback", function (done) {
                API.getProspectInfoAsync()
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);
                
                $timeout.flush();
            });

            it("has expected error with null prospectId", function (done) {
                prospectId = null;

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("has expected error with undefined prospectId", function (done) {
                prospectId = undefined;

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("has expected error with blank prospectId", function (done) {
                prospectId = "";

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("has expected error with non-string prospectId", function (done) {
                prospectId = { id: "something" };

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error.message).toBe("prospectId is required");
                    })
                    .finally(done);

                $timeout.flush();
            });

        });

        describe("general functionality", function () {

            it("successCallback and finallyCallback are called", function (done) {
                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
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

                API.getProspectInfoAsync(prospectId)
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

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({message: ""});
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("data form load failure with no error info triggers correct behavior", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = null;

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail)
                    .catch(function (error) {
                        expect(error).toEqual({message: ""});
                    })
                    .finally(done);

                $timeout.flush();
            });

            it("sets ID to upper case value", function (done) {
                prospect = {
                    displayName: "Dr. Robert Hernandez, Class of 1990",
                    firstName: "Robert",
                    keyName: "Hernandez",
                    pictureThumbnail: "",
                    deceased: false,
                    inactive: false,
                    phoneNumbers: null,
                    emailAddresses: null,
                    jobTitle: null,
                    primaryBusinessId: "9460c844-8e34-4b21-b7f7-0fb00539bc02",
                    primaryBusinessName: null,
                    spouseId: "3fa192ce-988d-459d-be73-97771f4c084b",
                    spouseFirstName: null,
                    spouseLastName: null,
                    spouseDeceased: false,
                    nextStepPlanId: null,
                    nextStepPlanName: null,
                    nextStepContactMethodId: null,
                    nextStepContactMethod: null,
                    nextStepObjective: null,
                    nextStepLocation: null,
                    nextStepDate: null,
                    nextStepTime: null,
                    nextStepId: "c8ad2ff3-8e29-4186-86a5-7a2c77c7adce",
                    nextStepComments: null,
                    prospectManagerFirstName: "Henry",
                    prospectManagerKeyName: "Higgins",
                    prospectManagerId: "43eed8cb-8a0e-4bea-85e1-72005d574eec",
                    primaryMemberId: "39910dd7-6195-4d61-8b62-3966e4a7e3f4",
                    primaryMemberFirstName: null,
                    primaryMemberKeyName: null,
                    prospectFullName: "Robert Hernandez"
                
                };

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        prospect.primaryBusinessId = "9460C844-8E34-4B21-B7F7-0FB00539BC02";
                        prospect.spouseId = "3FA192CE-988D-459D-BE73-97771F4C084B";
                        prospect.nextStepId = prospect.nextStepId.toUpperCase();
                        prospect.prospectManagerId = prospect.prospectManagerId.toUpperCase();
                        prospect.primaryMemberId = "39910DD7-6195-4D61-8B62-3966E4A7E3F4";
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("does not error with null IDs", function (done) {
                prospect = {
                    displayName: "Dr. Robert Hernandez, Class of 1990",
                    firstName: "Robert",
                    keyName: "Hernandez",
                    pictureThumbnail: null,
                    deceased: false,
                    inactive: false,
                    phoneNumbers: null,
                    emailAddresses: null,
                    jobTitle: null,
                    primaryBusinessId: null,
                    primaryBusinessName: null,
                    spouseId: null,
                    spouseFirstName: null,
                    spouseLastName: null,
                    spouseDeceased: false,
                    nextStepPlanId: null,
                    nextStepPlanName: null,
                    nextStepContactMethodId: null,
                    nextStepContactMethod: null,
                    nextStepObjective: null,
                    nextStepLocation: null,
                    nextStepDate: null,
                    nextStepTime: null,
                    nextStepId: null,
                    nextStepComments: null,
                    prospectManagerFirstName: null,
                    prospectManagerKeyName: null,
                    prospectManagerId: null,
                    primaryMemberId: null,
                    primaryMemberFirstName: null,
                    primaryMemberKeyName: null,
                    prospectFullName: "Robert Hernandez"
                };

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

        });

        describe("fields", function () {

            it("does not return empty business id", function (done) {
                prospect.primaryBusinessId = "00000000-0000-0000-0000-000000000000";

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

            it("formats spouse name correctly", function (done) {
                prospect.spouseFirstName = "";

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

            it("formats primary member name correctly", function (done) {
                prospect.primaryMemberFirstName = "Laura";

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("formats prospect manager name correctly", function (done) {
                prospect.prospectManagerFirstName = "Henry";

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("formats next step time correctly", function (done) {
                prospect.nextStepTime = "0001";

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

            describe("phone numbers", function () {

                it("works with none", function (done) {
                    prospect.phoneNumbers = null;

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

                it("works with no extra info", function (done) {
                    prospect.phoneNumbers = [
                        {
                            number: "843-555-1234"
                        }
                    ];

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

                it("works with a type", function (done) {
                    prospect.phoneNumbers = [
                        {
                            number: "843-555-1234",
                            type: "Home"
                        }
                    ];

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

                it("works with confidential", function (done) {
                    prospect.phoneNumbers = [
                        {
                            number: "843-555-1234",
                            confidential: true
                        }
                    ];

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

            });

            describe("email addresses", function () {

                it("works with none", function (done) {
                    prospect.emailAddresses = null;

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

                it("works with no extra info", function (done) {
                    prospect.emailAddresses = [
                        {
                            address: "bob.hernandez@blackbaud.com"
                        }
                    ];

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

                it("works with a type", function (done) {
                    prospect.emailAddresses = [
                        {
                            address: "bob.hernandez@blackbaud.com",
                            type: "Work"
                        }
                    ];

                    API.getProspectInfoAsync(prospectId)
                        .then(function (response) {
                            transformProspect();
                            expect(response).toEqual(prospect);
                        })
                        .catch(failureCallbackFail)
                        .finally(done);
                
                    $timeout.flush();
                });

            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {
                var originalProspect = prospect;

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect(originalProspect);
                        expect(response).toEqual(originalProspect);

                        prospect = { displayName: "Paul McCartney" };

                        return API.getProspectInfoAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalProspect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

            it("caches a copy of the results", function (done) {
                var originalProspect = prospect;

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect(originalProspect);
                        expect(response).toEqual(originalProspect);

                        response.displayName = "Paul McCartney";
                        prospect = { displayName: "Ringo Starr" };

                        return API.getProspectInfoAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalProspect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

            it("caches based on prospect id", function (done) {
                var originalProspect = prospect;

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect(originalProspect);
                        expect(response).toEqual(originalProspect);

                        prospect = {
                            displayName: "Ringo Starr",
                            firstName: "Ringo",
                            keyName: "Starr",
                            pictureThumbnail: "",
                            deceased: false,
                            inactive: false,
                            phoneNumbers: null,
                            emailAddresses: null,
                            jobTitle: null,
                            primaryBusinessId: null,
                            primaryBusinessName: null,
                            spouseId: null,
                            spouseFirstName: null,
                            spouseLastName: null,
                            spouseDeceased: false,
                            nextStepPlanId: null,
                            nextStepPlanName: null,
                            nextStepContactMethodId: null,
                            nextStepContactMethod: null,
                            nextStepObjective: null,
                            nextStepLocation: null,
                            nextStepDate: null,
                            nextStepTime: null,
                            nextStepId: null,
                            nextStepComments: null,
                            prospectManagerFirstName: "Henry",
                            prospectManagerKeyName: "Higgins",
                            prospectManagerId: "43EED8CB-8A0E-4BEA-85E1-72005D574EEC",
                            primaryMemberId: null,
                            primaryMemberFirstName: null,
                            primaryMemberKeyName: null,
                            prospectFullName: "Ringo Starr"
                        
                        };

                        prospectId = "29AB9D7A-39F9-4F06-A601-2C134C4EC541";

                        return API.getProspectInfoAsync(prospectId);
                    })
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);
                
                $timeout.flush();
            });

            it("does not cache failure", function (done) {
                dataFormLoadIsSuccessful = false;
                dataFormLoadError = {
                    message: "Test error 2"
                };

                API.getProspectInfoAsync(prospectId)
                    .then(successCallbackFail, function (error) {
                        expect(error).toEqual(dataFormLoadError);

                        dataFormLoadIsSuccessful = true;

                        return API.getProspectInfoAsync(prospectId);
                    })
                    .then(function (response) {
                        transformProspect();
                        expect(response).toEqual(prospect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

            it("cache does not care about prospectId case", function (done) {
                prospectId = "5d01292a-d400-4d06-8848-70561d71de9e";

                var originalProspect = prospect;

                API.getProspectInfoAsync(prospectId)
                    .then(function (response) {
                        transformProspect(originalProspect);
                        expect(response).toEqual(originalProspect);

                        prospect = { displayName: "Paul McCartney" };
                        prospectId = "5D01292A-D400-4D06-8848-70561D71DE9E";

                        return API.getProspectInfoAsync(prospectId);
                    })
                    .then(function (response) {
                        expect(response).toEqual(originalProspect);
                    })
                    .catch(failureCallbackFail)
                    .finally(done);

                $timeout.flush();
            });

        });

    });

}());
