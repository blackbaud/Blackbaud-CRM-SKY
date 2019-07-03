/*jshint jasmine: true */
/*globals module, inject, setTimeout, angular */

(function () {
    'use strict';

    describe('upcoming steps', function () {

        var $rootScope,
            $scope,
            $controller,
            $state,
            $injector,
            $timeout,
            $q,
            API,
            bbMoment,
            getStepsIsSuccessful,
            getStepsFailureData,
            steps,
            waitTime,
            prospectId,
            controller,
            userGrantedInteractionOrStepAddForm,
            securityUserGrantedFeatureShouldFail;

        function initializeController() {

            controller = $controller("UpcomingStepsController", {
                $scope: $scope,
                prospectId: prospectId
            });

            // Force promises to fulfill.
            $scope.$digest();
        }

        beforeEach(function () {

            module('frog.api');

            module('infinity.util');

            module(function ($provide) {

                function getRecentStepsAsync() {
                    var deferred = $q.defer();

                    if (waitTime) {
                        setTimeout(getRecentStepsAsyncImpl, waitTime);
                    } else {
                        getRecentStepsAsyncImpl();
                    }

                    return deferred.promise;

                    function getRecentStepsAsyncImpl() {
                        if (getStepsIsSuccessful) {
                            return deferred.resolve({
                                steps: steps
                            });
                        }

                        return deferred.reject(getStepsFailureData);
                    }
                }

                function securityUserGrantedFeature(id, featureType) {
                    var FormFeatureType = 1,
                        InteractionOrStepAddFormId = "8EAB8484-8188-4E63-A514-E08BEA349A05";

                    if (securityUserGrantedFeatureShouldFail) {
                        return $q.reject({ message: "Error requesting securityUserGrantedFeature." });
                    }

                    if (id.toUpperCase() === InteractionOrStepAddFormId && featureType === FormFeatureType) {
                        return $q.resolve({
                            data: {
                                granted: userGrantedInteractionOrStepAddForm
                            }
                        });
                    }

                    fail("Unknown feature ID or feature type.");
                }

                function getAuthInterceptors() {
                    return [
                        function () {
                            return {
                                "responseError": function (response) {
                                    return $q.reject(response);
                                }
                            };
                        }
                    ];
                }

                $provide.value("api", {
                    initialize: angular.noop,
                    getDatabaseName: function () {
                        return "BBInfinityMock";
                    },
                    getRecentStepsAsync: getRecentStepsAsync,
                    getAuthInterceptors: getAuthInterceptors
                });

                $provide.value("bbuiShellService", {
                    create: function () {
                        return {
                            securityUserGrantedFeature: securityUserGrantedFeature
                        };
                    }
                });

            });

            module('frog');

        });

        //Inject objects needed to drive the controller
        beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$injector_, _$timeout_, _api_, _bbMoment_, _$q_) {

            $rootScope = _$rootScope_;
            $controller = _$controller_;
            $state = _$state_;
            $injector = _$injector_;
            $timeout = _$timeout_;
            $q = _$q_;
            API = _api_;
            bbMoment = _bbMoment_;

            $scope = _$rootScope_.$new();

        }));

        describe("UpcomingStepsController", function () {

            beforeEach(function () {

                prospectId = "1234";

                controller = null;

                getStepsIsSuccessful = true;

                getStepsFailureData = {
                    message: "Test error 1"
                };

                steps = [
                    {
                        objective: "Email about proposal",
                        date: bbMoment().subtract(1)
                    }
                ];

                waitTime = 0;

                userGrantedInteractionOrStepAddForm = true;
                securityUserGrantedFeatureShouldFail = false;

            });

            describe("basic functionality", function () {

                it("initialize sets expected values and loads the steps", function (done) {

                    waitTime = 2000;

                    initializeController();

                    expect($scope.frogResources).toBeDefined("frogResources");
                    expect($scope.frogResources.upcomingsteps_tile_header).toBe("Upcoming steps/interactions");
                    expect($scope.frogResources.label_dash_format).toBe("{0} - ");
                    expect($scope.frogResources.label_bar_format).toBe("{0} | ");
                    expect($scope.frogResources.noplan).toBe("No plan");
                    expect($scope.frogResources.comments).toBe("Comments");
                    expect($scope.frogResources.nosteps).toBe("No steps/interactions found");
                    expect($scope.frogResources.error_loading_steps).toBe("Error loading steps. {0}");

                    expect($scope.bbMoment).toBeDefined("bbMoment");

                    expect($scope.locals).toExist("locals");
                    expect($scope.locals.loadError).not.toBeDefined("loadError");
                    expect($scope.locals.upcomingSteps).not.toBeDefined("upcomingSteps");
                    expect($scope.locals.loading).toBe(true, "loading");

                    setTimeout(function () {
                        $scope.$digest();

                        expect($scope.locals.loading).toBe(false, "loading");
                        expect($scope.locals.loadError).not.toBeDefined("loadError");
                        expect($scope.locals.upcomingSteps).toEqual(steps);

                        done();
                    }, waitTime + 1000);

                });

                it("get steps failure sets expected values", function () {

                    getStepsIsSuccessful = false;

                    initializeController();

                    expect($scope.locals.steps).not.toBeDefined("steps");
                    expect($scope.locals.loading).toBe(false, "loading");
                    expect($scope.locals.loadError).toBe("Error loading steps. Test error 1");

                });

                it("get security user granted feature fails causing buttons to remain disabled", function () {
                    securityUserGrantedFeatureShouldFail = true;
                    initializeController();
                    expect($scope.locals.grantedInteractionOrStepAddForm).toBe(false);
                });

                it("user does not have rights to interaction or step add form", function () {
                    userGrantedInteractionOrStepAddForm = false;
                    initializeController();
                    expect($scope.locals.grantedInteractionOrStepAddForm).toBe(false);
                });

                it("user does has rights to interaction or step add form", function () {
                    userGrantedInteractionOrStepAddForm = true;
                    initializeController();
                    expect($scope.locals.grantedInteractionOrStepAddForm).toBe(true);
                });

            });

        });

    });

}());
