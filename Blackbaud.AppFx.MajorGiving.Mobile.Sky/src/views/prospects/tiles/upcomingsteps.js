/*global angular, console */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('UpcomingStepsController', UpcomingStepsController);

    UpcomingStepsController.$inject = ['$scope', 'bbMoment', 'frogApi', 'frogResources', 'prospectUtilities', 'bbModal', 'bbuiShellService', 'prospectId'];

    /**
     * The controller for the Upcoming Steps tile. This tile shows information on upcoming steps/interactions for the prospect.
     * 
     * @param {String} prospectId The system ID of the prospect.
     */
    function UpcomingStepsController($scope, bbMoment, frogApi, frogResources, prospectUtilities, bbModal, bbuiShellService, prospectId) {

        var locals;

        $scope.frogResources = frogResources;
        $scope.openContactReport = openContactReport;
        $scope.openContactReportFromUpcomingStep = openContactReportFromUpcomingStep;
        $scope.bbMoment = bbMoment;
        $scope.locals = locals = {
            loading: false,
            grantedInteractionOrStepAddForm: false
        };

        $scope.$on("stepSaved", function () {
            loadSteps();
        });

        function loadSteps() {
            locals.loading = true;
            var options = {
                parameters: [
                    {
                        id: "INCLUDECOMPLETED",
                        value: false
                    },
                    {
                        id: "INCLUDEPENDING",
                        value: true
                    },
                    {
                        id: "SHOULDORDERASCENDING",
                        value: true
                    },
                    {
                        id: "ASOFDATE",
                        value: new Date().toISOString() // This is required because datalist parameters are passed as urls
                    }
                ]
            };

            frogApi.getRecentStepsAsync(prospectId, options)
                .then(function (response) {
                    locals.upcomingSteps = response.steps;
                })
                .catch(function (error) {
                    locals.loadError = frogResources.error_loading_steps.format(error.message);
                })
                .finally(function () {
                    locals.loading = false;
                });
        }

        function checkPermissions() {
            var svc = bbuiShellService.create(),
                InteractionOrStepAddFormId = "8eab8484-8188-4e63-a514-e08bea349a05",
                FormFeatureType = 1;

            svc.securityUserGrantedFeature(InteractionOrStepAddFormId, FormFeatureType)
                .then(function (response) {
                    locals.grantedInteractionOrStepAddForm = response.data.granted;
                })
                .catch(function (response) {
                    console.warn("securityUserGrantedFeature failed: " + response.data);
                });
        }

        function showContactReport(options) {
            bbModal.open(
                {
                    controller: 'ContactReportController as reportCtrl',
                    templateUrl: 'views/contactreport/contactreport.html',
                    resolve: {
                        options: function () {
                            return options;
                        }
                    }
                }
            );
        }

        function openContactReport(options) {
            options = options || {};
            options.prospectId = prospectId;
            showContactReport(options);
        }

        function openContactReportFromUpcomingStep(step) {
            var options = {
                prospectId: prospectId,
                stepInfo: {
                    stepId: step.id,
                    contactMethod: step.contactMethod,
                    objective: step.objective,
                    date: step.date,
                    planType: prospectUtilities.PLAN_TYPE.PROSPECT
                }
            };

            if (step.planId) {
                options.editStep = true;
                options.stepInfo.planType = prospectUtilities.PLAN_TYPE.PROSPECT;
                options.stepInfo.planId = step.planId;
            } else {
                options.editInteraction = true;
                options.stepInfo.planType = prospectUtilities.NONE;

            }

            showContactReport(options);
        }

        function init() {
            loadSteps();
            checkPermissions();
        }

        init();
    }

}());
