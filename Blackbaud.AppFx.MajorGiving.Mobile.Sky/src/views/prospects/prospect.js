/* global angular */

(function () {
    'use strict';

    angular
        .module('frog')
        .controller('ProspectPageController', ProspectPageController);

    ProspectPageController.$inject = ['$scope', '$state', 'bbWait', 'bbWindow', 'frogApi', 'frogResources', 'slug', 'prospectUtilities', 'mapping', 'bbModal', 'prospectId', 'prospectIdWithSlug', 'prospectName'];

    function ProspectPageController($scope, $state, bbWait, bbWindow, frogApi, frogResources, slug, prospectUtilities, mapping, bbModal, prospectId, prospectIdWithSlug, prospectName) {
        var self = this,
            waiting = false,
            locals = $scope.locals = {
                pictureString: null
            };

        self.loading = true;
        self.prospect = {
            displayName: prospectName
        };
        self.getProspectLink = getProspectLink;
        self.openContactReport = openContactReport;
        self.openAddresses = openAddresses;

        $scope.$on('$stateChangeSuccess', function () {
            if (waiting) {
                waiting = false;
                bbWait.endPageWait();
            }
        });
        $scope.$on("stepSaved", function () {
            loadProspect(true);
        });
        $scope.resources = frogResources;
        $scope.mapping = mapping;
        $scope.prospectId = prospectId;

        bbWindow.setWindowTitle(prospectName);

        function loadProspect(forceReload) {
            waiting = true;
            bbWait.beginPageWait();

            frogApi.getProspectInfoAsync(prospectId, { forceReload: forceReload })
                .then(function (prospect) {
                    var nextStepInfo,
                        currentProspectIdWithSlug,
                        name = prospect.keyName;

                    if (prospect.firstName) {
                        name = prospect.firstName + " " + name;
                    }

                    nextStepInfo = prospectUtilities.getNextStepInfo(prospect.nextStepDate);
                    prospect.nextStep = nextStepInfo.text;
                    prospect.nextStepLabelClass = nextStepInfo.labelClass;

                    self.prospect = prospect;
                    bbWindow.setWindowTitle(prospect.displayName);

                    currentProspectIdWithSlug = slug.prependSlug(name, prospectId);

                    if (prospect.pictureThumbnail) {
                        locals.pictureString = "data:image/JPEG;base64," + prospect.pictureThumbnail;
                    }

                    //if (prospectIdWithSlug !== currentProspectIdWithSlug) {
                    //    $state.go(
                    //        'prospects.prospect',
                    //        {
                    //            prospectId: currentProspectIdWithSlug
                    //        }
                    //    );
                    //}
                })
                .catch(function (error) {
                    self.loadError = frogResources.error_prospectview_general.format(error.message);
                })
                .finally(function () {
                    self.loading = false;
                    waiting = false;
                    bbWait.endPageWait();
                });
        }

        function openContactReport(options) {

            options = options || {};
            options.prospectId = prospectId;

            if (options.fileContactReport) {
                options.stepInfo = {
                    stepId: self.prospect.nextStepId,
                    contactMethod: self.prospect.nextStepContactMethod,
                    objective: self.prospect.nextStepObjective,
                    date: self.prospect.nextStepDate,
                    time: self.prospect.nextStepTime,
                    planType: self.prospect.nextStepPlanType,
                    planName: self.prospect.nextStepPlanName
                };
            }

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

        function getProspectLink(id, name) {
            return {
                prospectId: slug.prependSlug(name, id),
                prospectName: name
            };
        }


        function openAddresses(options) {

            options = options || {};
            options.prospectId = prospectId;

            bbModal.open(
                {
                    controller: 'AddressesModalController as addressesModalCtrl',
                    templateUrl: 'views/addresses/addressesmodal.html',
                    resolve: {
                        options: function () {
                            return options;
                        }
                    }
                }
            );

        }

        function apply() {
            var RecentSteps = "RecentSteps",
                UpcomingSteps = "UpcomingSteps",
                RecentGiftsAndCredits = "RecentGiftsAndCredits",
                SummaryInformation = "SummaryInformation";

            loadProspect(false);

            self.tiles = [
                {
                    id: RecentSteps,
                    view_name: "recentsteps",
                    collapsed: false,
                    collapsed_small: true
                },
                {
                    id: UpcomingSteps,
                    view_name: "upcomingsteps",
                    collapsed: false,
                    collapsed_small: true
                },
                {
                    id: RecentGiftsAndCredits,
                    view_name: "recentgiftsandcredits",
                    collapsed: false,
                    collapsed_small: true
                },
                {
                    id: SummaryInformation,
                    view_name: "summaryinformation",
                    collapsed: false,
                    collapsed_small: true
                }
            ];

            self.tileLayout = {
                one_column_layout: [
                    RecentSteps,
                    UpcomingSteps,
                    RecentGiftsAndCredits,
                    SummaryInformation
                ],
                two_column_layout: [
                    [
                        RecentSteps,
                        RecentGiftsAndCredits
                    ],
                    [
                        UpcomingSteps,
                        SummaryInformation
                    ]
                ]
            };
        }

        apply();
    }

}());
