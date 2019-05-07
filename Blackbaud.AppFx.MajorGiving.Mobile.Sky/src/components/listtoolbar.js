/*global angular */

(function () {
    'use strict';

    function FrogListToolbar(bbResources, frogResources) {

        return {
            require: '?^frogList',
            scope: {
                options: '=?frogListToolbarOptions'
            },
            transclude: true,
            link: function ($scope, el, attr, frogList) {

                function applySearchText() {

                    var searchEl;

                    searchEl = el.find('.bb-search-container input');
                    /*istanbul ignore else */
                    /* sanity check */
                    if (angular.isFunction(searchEl.select) && searchEl.length > 0 && $scope.searchText) {
                        searchEl.eq(0).select();
                    }

                    $scope.options.searchText = $scope.searchText;

                    /*istanbul ignore else */
                    /* sanity check */
                    if (frogList !== null) {
                        frogList.highlightSearchText();
                    }
                }

                function toggleFilterMenu(isOpen) {
                    if ($scope.options && $scope.options.hasInlineFilters) {
                        if (angular.isDefined(isOpen)) {
                            frogList.scope.options.filtersVisible = isOpen;
                            $scope.toolbarLocals.filtersVisible = isOpen;
                            if (isOpen) {
                                frogList.scope.options.contentsPaddingTop = '100px';
                            } else {
                                frogList.scope.options.contentsPaddingTop = '43px';
                            }
                        } else {
                            frogList.scope.options.filtersVisible = !$scope.toolbarLocals.filtersVisible;
                            $scope.toolbarLocals.filtersVisible = !$scope.toolbarLocals.filtersVisible;
                            if (frogList.scope.options.filtersVisible) {
                                frogList.scope.options.contentsPaddingTop = '100px';
                            } else {
                                frogList.scope.options.contentsPaddingTop = '43px';
                            }
                        }
                        /*istanbul ignore else */
                        /* sanity check */
                    }
                }

                function toggleSortMenu() {
                    frogList.scope.options.sortOpen = $scope.options.sortOpen = !$scope.options.sortOpen;
                }

                function onClickSort(index) {
                    if ($scope.options.sortOptionSelected) {
                        $scope.options.sortOptionSelected(index);
                    }
                }

                $scope.toolbarLocals = {
                    applySearchText: applySearchText,
                    openColumnPicker: angular.noop,
                    toggleFilterMenu: toggleFilterMenu,
                    toggleSortMenu: toggleSortMenu,
                    onClickSort: onClickSort
                };

                $scope.resources = bbResources;
                $scope.frogResources = frogResources;

                /*istanbul ignore else */
                /* sanity check */
                if (frogList !== null && angular.isUndefined($scope.options)) {
                    $scope.$watch(function () {
                        return frogList.scope.options;
                    }, function (newValue) {
                        $scope.options = newValue;
                    });
                }

                $scope.$watch('options.searchText', function (newValue) {
                    if (newValue !== $scope.searchText) {
                        $scope.searchText = newValue;
                    }
                });

                $scope.$watch('options.filtersOpen', function (newValue) {
                    if (angular.isDefined(newValue)) {
                        toggleFilterMenu(newValue);
                    }
                });

            },
            templateUrl: 'components/listtoolbar.html'
        };
    }

    FrogListToolbar.$inject = ['bbResources', 'frogResources'];

    angular.module('frog.list.toolbar', ['sky.resources', 'frog.resources'])
        .directive('frogListToolbar', FrogListToolbar);
}());
