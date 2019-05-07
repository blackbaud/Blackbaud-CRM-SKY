/*global angular */

(function () {
    'use strict';

    function reduceList(prospectsData, pat) {

        var matches = [],
            i;

        if (prospectsData && pat) {
            pat = pat.toUpperCase();
            for (i = 0; i < prospectsData.length; ++i) {
                if (prospectsData[i].name.toUpperCase().indexOf(pat) >= 0) {
                    matches.push(i);
                }

            }
        }

        return matches;

    }

    function ProspectListController($document, $scope, bbWindow, slug, frogResources, pageTitle, frogApi, bbWait, $state) {

        var self = this,
            prospectsData,
            selectedSort,
            waiting = false;

        $scope.$state = $state;

        $scope.$on('$stateChangeSuccess', function () {
            if (waiting) {
                waiting = false;
                bbWait.endPageWait();
            }
        });
        function beginLoading() {
            self.loading = true;
            if (!waiting) {
                waiting = true;
                bbWait.beginPageWait();
            }
        }

        function endLoading() {
            waiting = false;
            bbWait.endPageWait();
            self.loading = false;
        }

        function loadProspects(onlyPrimary, sort) {
            beginLoading();

            frogApi.getPortfolioAsync({
                onlyPrimary: onlyPrimary,
                sort: sort
            })
            .then(function (portfolio) {
                $scope.portfolioCount = frogResources.portfolio_count.format(portfolio.prospects.length.toLocaleString());
                prospectsData = portfolio;
                self.data = portfolio;

                $scope.toolbarOptions.dataReset = true;
            })
            .catch(function (error) {
                var message = frogResources.error_portfolio_general.format(error.message);
                self.loadError = message;
            })
            .finally(function () {
                searchTextChanged();
                endLoading();
            });
        }

        function getOnlyPrimary(prospectsFilter) {

            switch (prospectsFilter) {
                case "optionPrimary":
                    return true;
                default:
                    return false;
            }

        }

        function loadSettings() {

            var prospectsFilter = "",
                sort = 0;

            beginLoading();

            function getPortfolioSettingsSuccess(settings) {

                if (settings.onlyPrimary) {
                    prospectsFilter = "optionPrimary";
                }

                if (settings.sort) {
                    sort = settings.sort;
                }

            }

            function getPortfolioSettingsFinally() {

                var sortOptions;

                // sort

                sortOptions = [
                    {
                        title: frogResources.portfolio_sort_lastfirst
                    },
                    {
                        title: frogResources.portfolio_sort_nextstep
                    }
                ];

                sortOptions[sort].selected = true;

                $scope.toolbarOptions.sortOptions = sortOptions;
                selectedSort = sort;
                $scope.toolbarOptions.sortIsActive = sort ? true : false;

                // filters

                $scope.$watch(function () {
                    return $scope.toolbarOptions.filters;
                }, function (newValue) {

                    if (newValue && newValue.prospectsFilter) {
                        $scope.toolbarOptions.filtersAreActive = true;
                    } else {
                        $scope.toolbarOptions.filtersAreActive = false;
                    }

                    if (angular.isDefined(newValue)) {
                        loadProspects(getOnlyPrimary(newValue.prospectsFilter), selectedSort);
                    }

                }, true);

                if (!$scope.toolbarOptions.filters) {
                    $scope.toolbarOptions.filters = {};
                }

                if ($scope.toolbarOptions.filters.prospectsFilter !== prospectsFilter) {
                    $scope.toolbarOptions.filters.prospectsFilter = prospectsFilter;
                    if (prospectsFilter) {
                        $scope.toolbarOptions.filtersOpen = true;
                    }
                }

            }

            frogApi.getPortfolioSettingsAsync(getPortfolioSettingsSuccess, null, getPortfolioSettingsFinally);

        }

        function searchTextChanged() {
            if (angular.isDefined($scope.toolbarOptions.searchText) && $scope.toolbarOptions.searchText !== '') {

                var matches,
                    reducedPortfolio = [];

                matches = reduceList(prospectsData.prospects, $scope.toolbarOptions.searchText);

                matches.forEach(function (match) {
                    match = Number(match);
                    reducedPortfolio.push(prospectsData.prospects[match]);
                });

                $scope.portfolioCount = frogResources.portfolio_count.format(reducedPortfolio.length.toLocaleString());
                self.data = {
                    prospects: reducedPortfolio
                };

            } else if (self.data) {
                $scope.portfolioCount = frogResources.portfolio_count.format(prospectsData.prospects.length.toLocaleString());
                self.data = prospectsData;
            }

            $scope.toolbarOptions.dataReset = true;

        }

        self.getProspectIdWithSlug = function (prospect) {
            prospect = prospect || {};
            return slug.prependSlug(prospect.name, prospect.id);
        };

        bbWindow.setWindowTitle(pageTitle);

        $scope.resources = frogResources;

        $scope.toolbarOptions = {
            hideFilters: false,
            hasInlineFilters: true,
            hideSort: false,
            sortOptionSelected: function (index) {

                if (selectedSort === index) {
                    return;
                }

                $scope.toolbarOptions.sortOptions[selectedSort].selected = false;
                $scope.toolbarOptions.sortOptions[index].selected = true;
                selectedSort = index;

                $scope.toolbarOptions.sortIsActive = index ? true : false;

                loadProspects(getOnlyPrimary($scope.toolbarOptions.filters.prospectsFilter), index);

            }
        };

        $scope.$watch(function () {
            return $scope.toolbarOptions.searchText;
        }, searchTextChanged);

        loadSettings();
    }

    ProspectListController.$inject = ['$document', '$scope', 'bbWindow', 'slug', 'frogResources', 'pageTitle', 'frogApi', 'bbWait', '$state'];

    angular.module('frog').controller('ProspectListController', ProspectListController);

}());
