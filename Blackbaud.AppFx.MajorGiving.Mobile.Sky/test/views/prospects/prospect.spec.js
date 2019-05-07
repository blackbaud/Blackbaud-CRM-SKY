/*jshint jasmine: true */
/*globals module, inject, setTimeout, angular */

// TODO WI# 673039
// File a contact report button is disabled when user does not have rights
// $scope.openContactReport does not error with missing options param
// $scope.openContactReport does not error with null options param
// $scope.openContactReport does not error with {} options param
// $scope.openContactReport calls bbModal.open with expected parameters

(function () {
    'use strict';
    
    describe('prospect view', function () {

        var $rootScope,
            $scope,
            $controller,
            $state,
            $injector,
            bbWait,
            $timeout,
            $q,
            API,
            bbMoment,
            getProspectInfoIsSuccessful,
            getProspectInfoFailureData,
            windowTitle,
            prospect,
            prospectInfoWait,
            prospectId,
            prospectIdWithSlug,
            prospectName,
            controller;

        function initializeController() {

            controller = $controller("ProspectPageController", {
                $scope: $scope,
                prospectId: prospectId,
                prospectIdWithSlug: prospectIdWithSlug,
                prospectName: prospectName
            });

            $scope.$digest();

        }

        beforeEach(function () {

            module('frog.frogApi');

            module(function ($provide) {

                function getProspectInfoAsync() {
                    var deferred = $q.defer();

                    if (prospectInfoWait) {
                        setTimeout(getProspectInfoAsyncImpl, prospectInfoWait);
                    } else {
                        getProspectInfoAsyncImpl();
                    }

                    return deferred.promise;
                    
                    function getProspectInfoAsyncImpl() {
                        if (getProspectInfoIsSuccessful) {
                            deferred.resolve(prospect);
                        } else {
                            deferred.reject(getProspectInfoFailureData);
                        }
                    }
                }

                $provide.value("frogApi", {
                    initialize: angular.noop,
                    getDatabaseName: function () {
                        return "BBInfinityMock";
                    },
                    getProspectInfoAsync: getProspectInfoAsync
                });

            });

            module('frog');

            windowTitle = null;

            module(function ($provide, bbWindowProvider) {

                var bbWindow = bbWindowProvider.$get();
                bbWindow.setWindowTitle = function (title) {
                    windowTitle = title;
                };
                $provide.value("bbWindow", bbWindow);

            });

        });

        //Inject objects needed to drive the controller
        beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$injector_, _bbWait_, _$timeout_, _$q_, _api_, _bbMoment_) {

            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $state = _$state_;
            $injector = _$injector_;
            bbWait = _bbWait_;
            $timeout = _$timeout_;
            $q = _$q_;
            API = _api_;
            bbMoment = _bbMoment_;

            $scope = _$rootScope_.$new();

        }));

        describe("ProspectPageController", function () {

            beforeEach(function () {

                prospectId = "1234";
                prospectIdWithSlug = "robert-hernandez-1234";
                prospectName = "robert hernandez";

                controller = null;

                getProspectInfoIsSuccessful = true;

                getProspectInfoFailureData = {
                    message: "Test error 1"
                };

                prospect = {
                    displayName: "Dr. Robert Hernandez, Class of 1990"
                };

                prospectInfoWait = 0;

            });

            describe("basic functionality", function () {

                it("initialize sets expected values and loads the prospect", function (done) {

                    prospect = {
                        displayName: "Dr. Robert Hernandez, Class of 1990",
                        nextStepDate: bbMoment()
                    };

                    prospectInfoWait = 2000;

                    initializeController();

                    expect($scope.resources).toBeDefined("resources");
                    expect($scope.resources.deceased).toBe("Deceased");
                    expect($scope.resources.inactive).toBe("Inactive");
                    expect($scope.resources.spouse).toBe("Spouse");
                    expect($scope.resources.prospect_manager).toBe("Prospect manager");
                    expect($scope.resources.prospect_filecontactreport).toBe("File contact report");
                    expect($scope.resources.call).toBe("Call");
                    expect($scope.resources.text).toBe("Text");
                    expect($scope.resources.email).toBe("Email");
                    expect($scope.resources.contactinfo_withtype).toBe("{0}: {1}");
                    expect($scope.resources.label_colon_format).toBe("{0}:");
                    expect($scope.resources.prospect_nextstep_none).toBe("No future step");

                    expect($scope.locals.pictureString).toBe(null);

                    expect($scope.mapping).toBeDefined("mapping");
                    expect($scope.mapping.getMapUrl).toBeDefined("mapping.getMapUrl");
                    expect($scope.prospectId).toBe(prospectId);

                    expect(windowTitle).toBe(prospectName);
                    expect(controller.loadError).not.toBeDefined("loadError");
                    expect(controller.prospect).toEqual({
                        displayName: prospectName
                    });
                    expect(controller.loading).toBe(true, "loading");

                    setTimeout(function () {
                        $scope.$digest();

                        expect(windowTitle).toBe(prospect.displayName);
                        expect(controller.loading).toBe(false, "loading");
                        expect(controller.loadError).not.toBeDefined("loadError");
                        expect(controller.prospect).toEqual({
                            displayName: prospect.displayName,
                            nextStepDate: prospect.nextStepDate,
                            nextStep: "Today",
                            nextStepLabelClass: "label-warning"
                        });

                        done();
                    }, prospectInfoWait + 1000);

                });

                it("get prospect info failure sets expected values", function () {

                    getProspectInfoIsSuccessful = false;

                    initializeController();

                    expect(windowTitle).toBe(prospectName);
                    expect(controller.prospect).toEqual({
                        displayName: prospectName
                    });
                    expect(controller.loading).toBe(false, "loading");
                    expect(controller.loadError).toBe("Error loading prospect. Test error 1");

                });

                it("get portfolio failure works with no error info", function () {

                    getProspectInfoIsSuccessful = false;
                    getProspectInfoFailureData = { message: "" };

                    initializeController();

                    expect(windowTitle).toBe(prospectName);
                    expect(controller.prospect).toEqual({
                        displayName: prospectName
                    });
                    expect(controller.loading).toBe(false, "loading");
                    expect(controller.loadError).toBe("Error loading prospect. ");

                });

            });

            describe("waits", function () {

                it('while the prospect info is loading', function (done) {

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    prospectInfoWait = 2000;

                    initializeController();

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(0, "endPageWait 1");
                    expect(windowTitle).toBe(prospectName);
                    expect(controller.loadError).not.toBeDefined("loadError");
                    expect(controller.prospect).toEqual({
                        displayName: prospectName
                    });
                    expect(controller.loading).toBe(true, "loading");

                    setTimeout(function () {
                        $scope.$digest();
                        
                        expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                        expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");
                        expect(windowTitle).toBe(prospect.displayName);
                        expect(controller.loading).toBe(false, "loading");
                        expect(controller.loadError).not.toBeDefined("loadError");
                        expect(controller.prospect).toEqual(prospect);

                        done();
                    }, prospectInfoWait + 1000);

                });

                it('stops waiting if you navigate away', function () {

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    prospectInfoWait = 2000;

                    initializeController();

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(0, "endPageWait 1");
                    expect(windowTitle).toBe(prospectName);
                    expect(controller.loadError).not.toBeDefined("loadError");
                    expect(controller.prospect).toEqual({
                        displayName: prospectName
                    });
                    expect(controller.loading).toBe(true, "loading");

                    $scope.$broadcast("$stateChangeSuccess");

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");

                });

                it('does nothing if you navigate away when not waiting', function () {

                    spyOn(bbWait, "beginPageWait").and.callThrough();
                    spyOn(bbWait, "endPageWait").and.callThrough();

                    initializeController();

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 1");
                    expect(controller.loading).toBe(false, "loading");

                    $scope.$broadcast("$stateChangeSuccess");
                    $timeout.flush();

                    expect(bbWait.beginPageWait.calls.count()).toBe(1, "beginPageWait 1");
                    expect(bbWait.endPageWait.calls.count()).toBe(1, "endPageWait 2");

                });

            });

        });

        describe("getProspectLink", function () {

            beforeEach(function () {

                prospectId = "1234";
                prospectIdWithSlug = "robert-hernandez-1234";
                prospectName = "robert hernandez";

                initializeController();

            });

            it("works with no parameters", function () {

                var expected = {
                    prospectId: undefined,
                    prospectName: undefined
                },
                    actual = controller.getProspectLink();

                expect(actual).toEqual(expected);

            });

            it("works with null prospectId", function () {

                var prospectId = null,
                    prospectName = "Robert Hernandez",
                    expected = {
                        prospectId: "robert-hernandez-null",
                        prospectName: prospectName
                    },
                    actual = controller.getProspectLink(prospectId, prospectName);

                expect(actual).toEqual(expected);

            });

            it("works with null prospectName", function () {

                var prospectId = "1234",
                    prospectName = null,
                    expected = {
                        prospectId: "1234",
                        prospectName: prospectName
                    },
                    actual = controller.getProspectLink(prospectId, prospectName);

                expect(actual).toEqual(expected);

            });

            it("works with blank prospectId", function () {

                var prospectId = "",
                    prospectName = "Robert Hernandez",
                    expected = {
                        prospectId: "robert-hernandez-",
                        prospectName: prospectName
                    },
                    actual;

                actual = controller.getProspectLink(prospectId, prospectName);

                expect(actual).toEqual(expected);

            });

            it("works with blank prospect name", function () {

                var prospectId = "1234",
                    prospectName = "",
                    expected = {
                        prospectId: "1234",
                        prospectName: prospectName
                    },
                    actual;

                actual = controller.getProspectLink(prospectId, prospectName);

                expect(actual).toEqual(expected);

            });

            it("creates slug", function () {

                var prospectId = "1234",
                    prospectName = "Robert Hernandez",
                    expected = {
                        prospectId: "robert-hernandez-1234",
                        prospectName: prospectName
                    },
                    actual;

                actual = controller.getProspectLink(prospectId, prospectName);

                expect(actual).toEqual(expected);

            });

        });

    });

}());
