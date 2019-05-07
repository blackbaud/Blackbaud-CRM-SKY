/*jshint jasmine: true */
/*globals module, inject, angular, $ */

(function () {
    'use strict';

    var $scope,
        $rootScope,
        $templateCache,
        $compile,
        $timeout,
        slug,
        bbMoment,
        testUtils,
        template = "views/prospects/prospectlist.html",
        PROSPECTLISTROW = "[bb-frog-testid='prospectListRow']",
        PROSPECTLISTROWINDEX = '[data-bbauto-index]',
        PROSPECTLIST = "[bb-frog-testid='prospectList']",
        LISTCONTENTS = "[bb-frog-testid='listContents']",
        EMPTYLIST = "[bb-frog-testid='emptyList']",
        LISTERROR = "[bb-frog-testid='listError']",
        ERRORMESSAGE = "[bb-frog-testid='errorMessage']",
        NEXTSTEPLABEL = "[bb-frog-testid='nextStepLabel']",
        NEXTSTEPDATE = "[bb-frog-testid='nextStepDate']";

    function compileFormWithState(controllerState, rootState) {
        controllerState = controllerState || {};

        $scope.prospectList = {};
        $scope.page = { portfolioActive: true };

        angular.extend($scope, rootState);
        angular.extend($scope.prospectList, controllerState);

        var el = angular.element('<div>' + $templateCache.get(template) + '</div>');
        $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
        $rootScope.$apply();

        // need to append to the body so that elements will be attached to the page dom and have a width etc.
        $('body').append(el);

        return el;
    }

    function checkState(formDOM) {

        testUtils.checkHtml(formDOM);

        // TODO check expected state here rather than in each test individually

    }

    beforeEach(function () {

        module("frog.test");

        module("frog");

        module("frog.util");

        module("frog.resources");

    });

    beforeEach(inject(function (_$rootScope_, _$templateCache_, _$compile_, _$timeout_, _slug_, _bbMoment_, _testUtils_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $timeout = _$timeout_;
        slug = _slug_;
        bbMoment = _bbMoment_;
        testUtils = _testUtils_;
    }));

    describe('prospectlist html', function () {
        //Changed for SP16 to show portfolio data/tab for any fundraiser
        it('shows correct pieces when no portfolio data exists', function () {
            var formDOM;

            formDOM = compileFormWithState({
                loading: true,
                data: {
                    prospects: []
                }
            });

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(EMPTYLIST)).toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();

            $scope.prospectList.loading = false;

            $rootScope.$digest();

            $timeout.flush();

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();
            expect(formDOM.find(EMPTYLIST)).toExist();

        });

        it('shows correct pieces when portfolio data exists', function () {
            var formDOM;

            formDOM = compileFormWithState({
                loading: true
            });

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();

            $scope.prospectList.loading = false;
            $scope.prospectList.data = {
                prospects: [
                    {
                        id: "e9ce4c98-6373-4d6d-a60f-a2030aa0999a",
                        name: "Robert Hernandez"
                    }
                ]
            };

            $rootScope.$digest();

            $timeout.flush();

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(PROSPECTLIST)).toExist();
            expect(formDOM.find(LISTCONTENTS)).toExist();
            expect(formDOM.find(EMPTYLIST)).not.toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();

        });

        it('shows empty list when search text has no match', function () {
            var formDOM;

            formDOM = compileFormWithState(
                {
                    loading: false,
                    data: {
                        prospects: []
                    }
                },
                {
                    toolbarOptions: {
                        searchText: "asdf"
                    }
                }
            );

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(PROSPECTLIST)).toExist();
            expect(formDOM.find(LISTCONTENTS)).not.toExist();
            expect(formDOM.find(EMPTYLIST)).toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();

        });

        it('shows empty list when there are no primary prospects. WI# 661908', function () {

            var formDOM;

            formDOM = compileFormWithState(
                {
                    loading: false,
                    data: {
                        prospects: []
                    }
                },
                {
                    toolbarOptions: {
                        hideFilters: false,
                        hasInlineFilters: true,
                        filters: {
                            prospectsFilter: "optionPrimary"
                        }
                    }
                }
            );

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(PROSPECTLIST)).toExist();
            expect(formDOM.find(LISTCONTENTS)).not.toExist();
            expect(formDOM.find(EMPTYLIST)).toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();

        });

        it('shows a row for each prospect', function () {

            var formDOM,
                prospects = [],
                i,
                name,
                href,
                list,
                prospectLink,
                nextStepLabel,
                nextStepDate,
                now = bbMoment();

            for (i = 0; i < 20; ++i) {
                name = "First Last";
                if (i < 10) {
                    name += "0";
                }
                name += i;
                prospects.push({
                    id: i.toString(),
                    name: name,
                    nextStep: "No step"
                });
            }

            prospects[1].nextStep = "Today";
            prospects[1].labelClass = "label-warning";

            prospects[2].nextStep = "Past due";
            prospects[2].labelClass = "label-danger";

            prospects[3].nextStep = "Tomorrow";
            prospects[3].labelClass = "label-info";

            prospects[4].nextStep = now.format("l");

            formDOM = compileFormWithState({
                loading: false,
                data: {
                    prospects: prospects
                },
                getProspectIdWithSlug: function (prospect) {
                    prospect = prospect || {};
                    return slug.prependSlug(prospect.name, prospect.id);
                }
            });

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(PROSPECTLIST)).toExist();
            expect(formDOM.find(LISTCONTENTS)).toExist();
            expect(formDOM.find(EMPTYLIST)).not.toExist();

            list = formDOM.find(PROSPECTLISTROW).find(PROSPECTLISTROWINDEX);

            expect(list.length).toBe(prospects.length);

            for (i = 0; i < list.length; ++i) {

                name = "First Last";
                href = "/first-last";
                if (i < 10) {
                    name += "0";
                    href += "0";
                }
                name += i;
                href += i + "-" + i;

                prospectLink = $(list[i]).find("a");

                expect(prospectLink).toExist("prospect link");
                expect(prospectLink.text()).toBe(name);
                expect(prospectLink).toHaveAttr("href", href);

                nextStepLabel = $(list[i]).find(NEXTSTEPLABEL);
                nextStepDate = $(list[i]).find(NEXTSTEPDATE);

                switch (i) {
                    case 1:
                        expect(nextStepLabel).toExist("label should be shown");
                        expect(nextStepLabel.text()).toBe("Today");
                        expect(nextStepLabel).toHaveAttr("class");
                        expect(nextStepLabel.attr("class").indexOf("label-warning")).toBeGreaterThan(-1);
                        expect(nextStepDate).not.toExist("next step date should not be shown");
                        break;
                    case 2:
                        expect(nextStepLabel).toExist("label should be shown");
                        expect(nextStepLabel.text()).toBe("Past due");
                        expect(nextStepLabel).toHaveAttr("class");
                        expect(nextStepLabel.attr("class").indexOf("label-danger")).toBeGreaterThan(-1);
                        expect(nextStepDate).not.toExist("next step date should not be shown");
                        break;
                    case 3:
                        expect(nextStepLabel).toExist("label should be shown");
                        expect(nextStepLabel.text()).toBe("Tomorrow");
                        expect(nextStepLabel).toHaveAttr("class");
                        expect(nextStepLabel.attr("class").indexOf("label-info")).toBeGreaterThan(-1);
                        expect(nextStepDate).not.toExist("next step date should not be shown");
                        break;
                    case 4:
                        expect(nextStepLabel).not.toExist("label should not be shown");
                        expect(nextStepDate).toExist("next step date should be shown");
                        expect(nextStepDate.text()).toBe(now.format("l"));
                        expect(nextStepDate).toHaveAttr("class");
                        expect(nextStepDate.attr("class").indexOf("label")).toBe(-1);
                        break;
                    default:
                        expect(nextStepLabel).not.toExist("label should not be shown");
                        expect(nextStepDate).toExist("next step date should be shown");
                        expect(nextStepDate.text()).toBe("No step");
                        expect(nextStepDate).toHaveAttr("class");
                        expect(nextStepDate.attr("class").indexOf("label")).toBe(-1);
                }

            }

        });

        describe("errors", function () {

            it('shows a message when there is an error loading the list', function () {
                var formDOM;

                formDOM = compileFormWithState({
                    loading: true
                });

                checkState(formDOM);

                expect(formDOM.find(PROSPECTLISTROW)).toExist();
                expect(formDOM.find(LISTERROR)).not.toExist();

                $scope.prospectList.loading = false;
                $scope.prospectList.loadError = "Test error 1";

                $rootScope.$digest();

                checkState(formDOM);

                expect(formDOM.find(PROSPECTLISTROW)).not.toExist();
                expect(formDOM.find(LISTERROR)).toExist();
                expect(formDOM.find(ERRORMESSAGE).text()).toBe("Test error 1");

            });

            it('shows a message when there is an error loading the list even if data is populated', function () {
                var formDOM;

                formDOM = compileFormWithState({
                    loading: true
                });

                checkState(formDOM);

                expect(formDOM.find(PROSPECTLISTROW)).toExist();
                expect(formDOM.find(EMPTYLIST)).toExist();
                expect(formDOM.find(LISTERROR)).not.toExist();

                $scope.prospectList.loading = false;
                $scope.prospectList.data = {
                    prospects: [
                        {
                            id: "e9ce4c98-6373-4d6d-a60f-a2030aa0999a",
                            name: "Robert Hernandez"
                        }
                    ]
                };
                $scope.prospectList.loadError = "Test error 1";

                $rootScope.$digest();

                checkState(formDOM);

                expect(formDOM.find(PROSPECTLISTROW)).not.toExist();
                expect(formDOM.find(EMPTYLIST)).not.toExist();

                expect(formDOM.find(LISTERROR)).toExist();
                expect(formDOM.find(ERRORMESSAGE).text()).toBe("Test error 1");

            });

            it('shows a message when there is an error loading the list even if an empty list is populated', function () {
            var formDOM;

            formDOM = compileFormWithState({
                loading: true
            });

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).toExist();
            expect(formDOM.find(EMPTYLIST)).toExist();
            expect(formDOM.find(LISTERROR)).not.toExist();

            $scope.prospectList.loading = false;
            $scope.prospectList.data = {
                prospects: []
            };
            $scope.prospectList.loadError = "Test error 1";

            $rootScope.$digest();

            checkState(formDOM);

            expect(formDOM.find(PROSPECTLISTROW)).not.toExist();
            expect(formDOM.find(EMPTYLIST)).not.toExist();
            expect(formDOM.find(LISTERROR)).toExist();
            expect(formDOM.find(ERRORMESSAGE).text()).toBe("Test error 1");

        });

        });

        describe("filters", function () {

            it("displays and hides the filters when the filter button is pressed", function () {

                var formDOM,
                    filterButtonEl,
                    filterProspectsEl;

                formDOM = compileFormWithState(
                    {
                        loading: false,
                        data: {
                            prospects: [
                                {
                                    id: "e9ce4c98-6373-4d6d-a60f-a2030aa0999a",
                                    name: "Robert Hernandez"
                                }
                            ]
                        }
                    },
                    {
                        toolbarOptions: {
                            hideFilters: false,
                            hasInlineFilters: true,
                            filters: {}
                        }
                    }
                );

                checkState(formDOM);

                expect(formDOM.find(PROSPECTLISTROW)).toExist();
                expect(formDOM.find(PROSPECTLIST)).toExist();
                expect(formDOM.find(LISTCONTENTS)).toExist();
                expect(formDOM.find(EMPTYLIST)).not.toExist();
                expect(formDOM.find(LISTERROR)).not.toExist();

                filterProspectsEl = formDOM.find('[bb-frog-testid="prospectsFilter"]');

                expect(filterProspectsEl).not.toBeVisible("filters visible upon creation");

                filterButtonEl = formDOM.find('.bb-filter-btn');

                filterButtonEl.click();

                $scope.$digest();

                checkState(formDOM);

                expect(filterProspectsEl).toBeVisible("filters not visible after button click");

                $scope.toolbarOptions.filters.prospectsFilter = "optionPrimary";
                $scope.toolbarOptions.filtersAreActive = true;
                $scope.$digest();

                expect(filterButtonEl).toHaveClass('bb-filters-inline-active');

                $scope.toolbarOptions.filters.prospectsFilter = "";
                $scope.toolbarOptions.filtersAreActive = false;
                $scope.$digest();

                checkState(formDOM);

                expect(filterButtonEl).not.toHaveClass('bb-filters-inline-active');

                filterButtonEl.click();

                $scope.$digest();

                checkState(formDOM);

                expect(filterProspectsEl).not.toBeVisible("filters visible after second button click");

            });

            it("shows properly when the filter is set to only primary prospects", function () {

                var formDOM,
                    filterButtonEl,
                    filterProspectsEl;

                formDOM = compileFormWithState(
                    {
                        loading: false,
                        data: {
                            prospects: [
                                {
                                    id: "e9ce4c98-6373-4d6d-a60f-a2030aa0999a",
                                    name: "Robert Hernandez"
                                }
                            ]
                        }
                    },
                    {
                        toolbarOptions: {
                            hideFilters: false,
                            hasInlineFilters: true,
                            filters: {
                                prospectsFilter: "optionPrimary"
                            },
                            filtersAreActive: true,
                            filtersOpen: false
                        }
                    }
                );

                checkState(formDOM);

                expect(formDOM.find(PROSPECTLISTROW)).toExist();
                expect(formDOM.find(PROSPECTLIST)).toExist();
                expect(formDOM.find(LISTCONTENTS)).toExist();
                expect(formDOM.find(EMPTYLIST)).not.toExist();
                expect(formDOM.find(LISTERROR)).not.toExist();

                filterProspectsEl = formDOM.find('[bb-frog-testid="prospectsFilter"]');

                expect(filterProspectsEl).not.toBeVisible("filters not visible upon creation");

                filterButtonEl = formDOM.find('.bb-filter-btn');

                expect(filterButtonEl).toHaveClass('bb-filters-inline-active');

                filterButtonEl.click();

                $scope.$digest();

                checkState(formDOM);

                expect(filterProspectsEl).toBeVisible("filters visible after button click");

                $scope.toolbarOptions.filters.prospectsFilter = "";
                $scope.toolbarOptions.filtersAreActive = false;
                $scope.$digest();

                checkState(formDOM);

                expect(filterButtonEl).not.toHaveClass('bb-filters-inline-active');

            });

        });

    });

}());
