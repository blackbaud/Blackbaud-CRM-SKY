/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('crm api getPortfolioAsync', function () {

        var $q,
            $timeout,
            bbuiShellService,
            API,
            bbMoment,
            idMapIsSuccessful,
            idMapError,
            dataListLoadIsSuccessful,
            dataListLoadError,
            fundraiserId,
            prospects,
            sortedProspects;
        
        function invokeFailForFailureCallback() {
            fail("failureCallback");
        }

        function invokeFailForSuccessCallback() {
            fail("successCallback");
        }

        beforeEach(function () {

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {

                bbuiShellService = {
                    create: function () {

                        return {
                            idMap: function (idMapId, idMapType) {

                                if (idMapId === "C606C99A-FE2F-4F3E-AB48-3F4463344E92" && idMapType === 0) {

                                    if (idMapIsSuccessful) {
                                        return $q.resolve({
                                            data: {
                                                id: fundraiserId
                                            }
                                        });
                                    }

                                    return $q.reject(idMapError);
                                }

                                fail("Unknown idMap parameters");
                            },
                            dataListLoad: function (dataListId, fundraiserId, options) {

                                var onlyPrimary = false,
                                    sort = 0,
                                    result,
                                    i,
                                    prospectsToUse;

                                if (options && options.parameters && options.parameters.length) {
                                    options.parameters.forEach(function (param) {
                                        if (param.name === "ONLYPRIMARY") {
                                            onlyPrimary = param.value;
                                        } else if (param.name === "SORT") {
                                            sort = param.value;
                                        }
                                    });
                                }

                                if (dataListId === "da329c8b-773c-4501-8329-77047018f6a9") {

                                    if (dataListLoadIsSuccessful) {

                                        result = [];

                                        if (sort) {
                                            prospectsToUse = sortedProspects;
                                        } else {
                                            prospectsToUse = prospects;
                                        }

                                        for (i = 0; i < prospectsToUse.length; ++i) {
                                            if (onlyPrimary && prospectsToUse[i].test_primary || !onlyPrimary) {
                                                result.push({
                                                    values: [
                                                        prospectsToUse[i].id, // 0: PROSPECTID
                                                        prospectsToUse[i].keyName, // 1: PROSPECTKEYNAME
                                                        prospectsToUse[i].firstName, // 2: PROSPECTFIRSTNAME
                                                        prospectsToUse[i].nextStepDate, // 3: NEXTSTEPDATE
                                                        "   " // 4: NEXTSTEPTIME
                                                    ]
                                                });
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

        function getFullName(prospect) {
            var name = prospect.keyName;

            if (prospect.firstName) {
                name = prospect.firstName + " " + name;
            }

            return name;
        }

        function transformProspects(toTransform) {

            var result = [],
                i,
                name,
                prospect,
                now = bbMoment(),
                daysToNextStep;

            for (i = 0; i < toTransform.length; ++i) {

                name = getFullName(toTransform[i]);

                prospect = {
                    id: toTransform[i].id.toUpperCase(),
                    name: name,
                    nextStepDate: toTransform[i].nextStepDate
                };

                if (prospect.nextStepDate) {
                    daysToNextStep = Math.ceil(bbMoment(prospect.nextStepDate).diff(now, "days", true));
                } else {
                    daysToNextStep = null;
                }

                if (daysToNextStep < 0) {
                    prospect.nextStep = "Past due";
                    prospect.labelClass = "label-danger";
                } else if (daysToNextStep === 0) {
                    prospect.nextStep = "Today";
                    prospect.labelClass = "label-warning";
                } else if (daysToNextStep === 1) {
                    prospect.nextStep = "Tomorrow";
                    prospect.labelClass = "label-info";
                } else if (daysToNextStep === 2) {
                    prospect.nextStep = "2 days";
                    prospect.labelClass = "label-info";
                } else if (daysToNextStep === 3) {
                    prospect.nextStep = "3 days";
                    prospect.labelClass = "label-info";
                } else if (toTransform[i].nextStepDate) {
                    prospect.nextStep = bbMoment(toTransform[i].nextStepDate).format("l");
                } else {
                    prospect.nextStep = "No step";
                }

                result.push(prospect);

            }

            return result;

        }

        beforeEach(inject(function (_api_, _bbMoment_, _$q_, _$timeout_) {
            API = _api_;
            bbMoment = _bbMoment_;
            $q = _$q_;
            $timeout = _$timeout_;
        }));

        beforeEach(function () {

            idMapIsSuccessful = true;

            idMapError = {
                data: {
                    message: "Test error 2"
                }
            };

            dataListLoadIsSuccessful = true;

            dataListLoadError = {
                data: {
                    message: "Test error 4"
                }
            };

            fundraiserId = "C3FC52B4-B802-4765-936D-4B7BCF7D4DC4";

            var robertHernandez,
                aaaConcrete,
                wendyHernandez,
                paulMccartney,
                johnLennon,
                ringoStarr,
                georgeHarrison;

            robertHernandez = {
                firstName: "Robert",
                keyName: "Hernandez",
                id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                test_primary: true,
                nextStepDate: bbMoment().subtract(30, "days")
            };

            aaaConcrete = {
                keyName: "AAA Concrete",
                id: "75896CDA-5635-4F59-A261-956C476667AA"
            };

            wendyHernandez = {
                firstName: "Wendy",
                keyName: "Hernandez",
                id: "E00A6FE3-3750-47D1-8CBF-FBF08A8F744A",
                nextStepDate: bbMoment()
            };

            paulMccartney = {
                firstName: "Paul",
                keyName: "McCartney",
                id: "0A66FECD-A565-4F1C-A844-4337C9FFDE44",
                nextStepDate: bbMoment().add(1, "days")
            };

            johnLennon = {
                firstName: "John",
                keyName: "Lennon",
                id: "1506EB5B-9D1A-4637-B480-B6585E69E4A6",
                nextStepDate: bbMoment().add(2, "days")
            };

            ringoStarr = {
                firstName: "Ringo",
                keyName: "Starr",
                id: "62E52842-CB0E-493D-B88D-F082A1AC9EAE",
                nextStepDate: bbMoment().add(3, "days")
            };

            georgeHarrison = {
                firstName: "George",
                keyName: "Harrison",
                id: "4622184F-5FA8-413A-ABE6-7622345328CB",
                nextStepDate: bbMoment().add(30, "days")
            };

            prospects = [
                robertHernandez,
                aaaConcrete,
                wendyHernandez,
                paulMccartney,
                johnLennon,
                ringoStarr,
                georgeHarrison
            ];

            sortedProspects = [
                aaaConcrete,
                georgeHarrison,
                robertHernandez,
                wendyHernandez,
                johnLennon,
                paulMccartney,
                ringoStarr
            ];

        });

        it("success", function (done) {

            API.getPortfolioAsync()
                .then(function (response) {
                    expect(response).toEqual({
                        prospects: transformProspects(prospects)
                    });
                })
                .catch(invokeFailForFailureCallback)
                .finally(done);
            
            $timeout.flush();

        });

        it("id map failure triggers correct behavior", function (done) {

            idMapIsSuccessful = false;

            API.getPortfolioAsync()
                .then(invokeFailForSuccessCallback)
                .catch(function (error) {
                    expect(error).toEqual({
                        message: "Error mapping user to constituent. Test error 2"
                    });
                })
                .finally(done);
            
            $timeout.flush();

        });

        it("data list load failure triggers correct behavior", function (done) {

            dataListLoadIsSuccessful = false;

            API.getPortfolioAsync()
                .then(invokeFailForSuccessCallback)
                .catch(function (error) {
                    expect(error).toEqual({
                        message: "Test error 4"
                    });
                })
                .finally(done);

            $timeout.flush();

        });

        it("message is correct when app user is not linked", function (done) {

            fundraiserId = null;

            API.getPortfolioAsync()
                .then(invokeFailForSuccessCallback)
                .catch(function (error) {
                    expect(error).toEqual({
                        message: "Your user is not associated with a fundraiser."
                    });
                })
                .finally(done);
            
            $timeout.flush();

        });

        it("sets ID to upper case value", function (done) {

            fundraiserId = "c3fc52b4-b802-4765-936d-4b7bcf7d4dc4";

            prospects = [
                {
                    firstName: "Robert",
                    keyName: "Hernandez",
                    id: "3dcef174-b025-4619-b3db-79d2d77f3c29",
                    test_primary: true,
                    nextStepDate: bbMoment().subtract(30, "days")
                }
            ];

            API.getPortfolioAsync()
                .then(function (response) {
                    expect(response).toEqual({
                        prospects: transformProspects(prospects)
                    });
                })
                .catch(invokeFailForFailureCallback)
                .finally(done);
            
            $timeout.flush();

        });

        describe("options", function () {

            it("onlyPrimary returns primary prospects", function (done) {

                API.getPortfolioAsync({
                    onlyPrimary: true
                })
                .then(function (response) {
                    expect(response).toEqual({
                        prospects: transformProspects([prospects[0]])
                    });
                })
                .catch(invokeFailForFailureCallback)
                .finally(done);

                $timeout.flush();

            });

            it("sort returns ordered prospects", function (done) {

                API.getPortfolioAsync({
                    sort: 1
                })
                .then(function (response) {
                    expect(response).toEqual({
                        prospects: transformProspects(sortedProspects)
                    });
                })
                .catch(invokeFailForFailureCallback)
                .finally(done);

                $timeout.flush();

            });

        });

        describe("cache", function () {

            it("caches successful result", function (done) {

                var originalProspects = prospects;

                API.getPortfolioAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects)
                        });

                        prospects = [];

                        return API.getPortfolioAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects)
                        });
                    })
                    .catch(invokeFailForFailureCallback)
                    .finally(done);
                
                $timeout.flush();

            });

            it("caches a copy of the results", function (done) {

                var originalProspects = prospects;

                API.getPortfolioAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects)
                        });

                        response.prospects = [];
                        prospects = [];

                        return API.getPortfolioAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects)
                        });
                    })
                    .catch(invokeFailForFailureCallback)
                    .finally(done);
                
                $timeout.flush();

            });

            it("does not cache failure", function (done) {

                dataListLoadIsSuccessful = false;

                API.getPortfolioAsync()
                    .then(invokeFailForSuccessCallback, function (error) {
                        expect(error).toEqual({
                            message: "Test error 4"
                        });

                        dataListLoadIsSuccessful = true;
                        
                        return API.getPortfolioAsync();
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(prospects)
                        });
                    })
                    .catch(invokeFailForFailureCallback)
                    .finally(done);
                
                $timeout.flush();

            });

            it("does not return cached result for filter change", function (done) {

                var originalProspects = prospects;

                API.getPortfolioAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects)
                        });

                        response.prospects = [];
                        prospects = [];

                        return API.getPortfolioAsync({
                            onlyPrimary: true
                        });
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects[0])
                        });
                    })
                    .catch(invokeFailForFailureCallback)
                    .finally(done);
                
                $timeout.flush();

            });

            it("does not return cached result for sort change", function (done) {

                var originalProspects = prospects;

                API.getPortfolioAsync()
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(originalProspects)
                        });

                        response.prospects = [];
                        prospects = [];

                        return API.getPortfolioAsync({
                            sort: 1
                        });
                    })
                    .then(function (response) {
                        expect(response).toEqual({
                            prospects: transformProspects(sortedProspects)
                        });
                    })
                    .catch(invokeFailForFailureCallback)
                    .finally(done);

                $timeout.flush();

            });

        });

        describe("next step date", function () {

            describe("sql date", function () {

                it("shows correctly", function (done) {

                    var now = bbMoment(),
                        nextStepDate = now.format("YYYY-MM-DD"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

            });

            describe("sql datetime", function () {

                it("shows correctly at the earliest time", function (done) {

                    var now = bbMoment(),
                        nextStepDate = now.format("YYYY-MM-DD 00:00:00.000"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

                it("shows correctly at the latest time", function (done) {

                    var now = bbMoment(),
                        nextStepDate = now.format("YYYY-MM-DD 23:59:59.999"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

            });

            describe("sql datetimeoffset", function () {

                var utcOverMidnight;

                beforeEach(function () {
                    utcOverMidnight = (bbMoment.utc().date() !== bbMoment().date());
                });

                it("shows correctly at the earliest time", function (done) {

                    var now = bbMoment(),
                        nextStepDate = now.format("YYYY-MM-DD 00:00:00.000Z"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

                it("shows correctly at the latest time", function (done) {

                    var now = bbMoment(),
                        nextStepDate = now.format("YYYY-MM-DD 23:59:59.999Z"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

                it("shows correctly at the earliest utc time", function (done) {

                    var now = bbMoment.utc(),
                        nextStepDate = now.format("YYYY-MM-DD 00:00:00.000Z"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: utcOverMidnight ? "Today" : "Past due",
                            labelClass: utcOverMidnight ? "label-warning" : "label-danger"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

                it("shows correctly at the latest utc time", function (done) {

                    var now = bbMoment.utc(),
                        nextStepDate = now.format("YYYY-MM-DD 23:59:59.999Z"),
                        expected;

                    prospects = [
                        {
                            firstName: "Robert",
                            keyName: "Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Robert Hernandez",
                            id: "3DCEF174-B025-4619-B3DB-79D2D77F3C29",
                            nextStepDate: nextStepDate,
                            nextStep: utcOverMidnight ? "Tomorrow" : "Today",
                            labelClass: utcOverMidnight ? "label-info" : "label-warning"
                        }
                    ];

                    API.getPortfolioAsync()
                        .then(function (response) {
                            expect(response).toEqual({
                                prospects: expected
                            });
                        })
                        .catch(invokeFailForFailureCallback)
                        .finally(done);
                    
                    $timeout.flush();

                });

            });

        });

    });

}());
