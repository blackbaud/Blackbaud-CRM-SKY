/*jslint plusplus: true */
/*global angular, jQuery */

(function ($) {
    'use strict';


    angular.module('frog.list', ['sky.viewkeeper', 'sky.highlight', 'sky.resources', 'sky.grids.filters', 'sky.grids.actionbar', 'sky.window', 'frog.list.toolbar'])

        .directive('frogList', ['$window', '$compile', '$templateCache', 'bbViewKeeperBuilder', 'bbHighlight', 'bbResources', '$timeout',

            function ($window, $compile, $templateCache, bbViewKeeperBuilder, bbHighlight, bbResources, $timeout) {
                return {
                    replace: true,
                    transclude: {
                        "frogListContents": "frogListContents"
                    },
                    restrict: 'E',
                    scope: {
                        options: '=?frogListOptions'
                    },
                    controller: ['$scope', function ($scope) {
                        var locals,
                            self = this;

                        $scope.options = $scope.options || {};

                        if ($scope.options.filtersVisible) {
                            $scope.options.contentsPaddingTop = '100px';
                        } else {
                            $scope.options.contentsPaddingTop = '43px';
                        }

                        // We have removed the code for column pickers because we don't need that for FROG.
                        // Because we are using the same html as gridtoolbar, hard-code this value so the
                        // picker button does not show.
                        $scope.options.hideColPicker = true;

                        // Adding this here stops the filters list from being open on initial load.
                        $scope.options.filtersOpen = false;

                        self.setFilters = function (filters) {
                            /*istanbul ignore else */
                            /* sanity check */
                            if (angular.isFunction(locals.setFilters)) {
                                locals.setFilters(filters);
                            }
                        };

                        self.syncViewKeepers = function () {
                            /*istanbul ignore else */
                            /* sanity check */
                            if ($scope.syncViewKeepers) {
                                $scope.syncViewKeepers();
                            }
                        };

                        self.highlightSearchText = function () {
                            /*istanbul ignore else */
                            /* sanity check */
                            if (angular.isFunction(locals.highlightSearchText)) {
                                locals.highlightSearchText();
                            }
                        };

                        self.scope = $scope;

                        $scope.resources = bbResources;

                        locals = $scope.locals = {
                            hasColPicker: true,
                            hasFilters: true,
                            applySearchText: function () {
                                /*istanbul ignore else */
                                /* sanity check */
                                if (angular.isFunction(self.applySearchText)) {
                                    self.applySearchText();
                                }
                            }
                        };

                        $scope.$watch('options.viewKeeperOffsetElId', function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                if (self.viewKeeperChangedHandler) {
                                    self.viewKeeperChangedHandler(newValue);
                                }
                            }
                        });
                    }],
                    link: function ($scope, element, attr) {

                        $scope.customToolbar = {
                            hasCustomToolbar: false
                        };
                        $scope.customToolbar.hasCustomToolbar = angular.isDefined(attr.frogListCustomToolbar);

                        $scope.$watch('locals.hasCustomToolbar', function () {
                            var id,
                                locals = $scope.locals,
                                toolbarContainer = element.find('.bb-grid-toolbar-viewkeeper'),
                                toolbarContainerId,
                                verticalOffSetElId,
                                vkToolbars,
                                windowEl = $($window),
                                windowEventId,
                                frogListContentsEl = element.find("[ng-transclude='frogListContents']");

                            function highlightSearchText() {
                                var options = $scope.options;
                                bbHighlight.clear(frogListContentsEl);
                                if (options && options.searchText) {
                                    bbHighlight(frogListContentsEl.find(".frog-list-search").not('.bb-grid-no-search'), options.searchText, 'highlight');
                                }
                            }

                            function setupToolbarViewKeepers() {
                                if (vkToolbars) {
                                    vkToolbars.destroy();
                                }

                                /*istanbul ignore else */
                                /* sanity check */
                                if ($scope.options) {
                                    verticalOffSetElId = $scope.options.viewKeeperOffsetElId;
                                }

                                if (!$scope.options || !$scope.options.fixedToolbar) {
                                    vkToolbars = new bbViewKeeperBuilder.create({
                                        el: toolbarContainer[0],
                                        setWidth: true,
                                        verticalOffSetElId: verticalOffSetElId,
                                        boundaryEl: frogListContentsEl
                                    });
                                }


                            }

                            locals.highlightSearchText = highlightSearchText;

                            locals.setFilters = function (filters) {
                                $scope.options.filters = filters;
                                $scope.locals.applySearchText();
                            };

                            id = $scope.$id;
                            toolbarContainerId = id + '-toolbar-container';

                            //Apply unique id to the table.  ID is required by jqGrid.
                            toolbarContainer.attr('id', toolbarContainerId);

                            // Replaces grids.js setData
                            $scope.$watch('options.dataReset', function (newValue) {
                                if (newValue) {
                                    $scope.options.dataReset = false;
                                    $timeout(highlightSearchText);
                                }
                            });

                            $scope.syncViewKeepers = function () {
                                /*istanbul ignore else */
                                /* sanity check */
                                if (vkToolbars) {
                                    vkToolbars.syncElPosition();
                                }
                            };

                            $scope.$watchGroup(['options.viewKeeperOffsetElId', 'options.fixedToolbar'], function () {
                                setupToolbarViewKeepers();
                            });

                            $scope.$watch('options.filters', function (f) {
                                $scope.$broadcast('updateAppliedFilters', f);
                            });

                            windowEventId = 'froglist' + id;

                            element.on('$destroy', function () {

                                /*istanbul ignore else */
                                /* sanity check */
                                if (vkToolbars) {
                                    vkToolbars.destroy();
                                }

                                windowEl.off('resize.' + windowEventId + ', orientationchange.' + windowEventId);

                            });
                        });
                    },
                    templateUrl: 'components/list.html'
                };
            }]);
}(jQuery));
