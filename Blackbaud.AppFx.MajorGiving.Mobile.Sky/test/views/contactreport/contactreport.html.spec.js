/*jshint jasmine: true */
/*globals module, inject, angular, $ */

(function () {
    'use strict';

    var $scope,
        $rootScope,
        $templateCache,
        $compile,
        testUtils,

        state,

        template = "views/contactreport/contactreport.html",

        HEADER = "[bb-frog-testid='header']",
        OTHERACTIONS = "[bb-frog-testid='otherActions']",
        PLAN = "[bb-frog-testid='plan']",
        FIELDSECTION = "[bb-frog-testid='fieldSection']",
        ERRORMESSAGE = "[bb-frog-testid='errorMessage']",
        SAVEBUTTON = "[bb-frog-testid='saveButton']",

        OtherLocationId = "84A394FE-55B8-4737-9B2F-CC478766EC39";

    function compileFormWithState(controllerState, rootState) {

        controllerState = controllerState || {};

        angular.extend($scope, rootState);
        angular.extend($scope.locals, controllerState);

        var el = angular.element('<div>' + $templateCache.get(template) + '</div>');
        $compile(el)($scope); // apply the current before promises are fired. (This is important because in the real world there could be several digest cycles run before our promises complete.)
        $rootScope.$apply();

        // need to append to the body so that elements will be attached to the page dom and have a width etc.
        $('body').append(el);

        return el;
    }

    /**
     * @private
     *
     * @param {Object} options
     *
     * @param {Boolean} [options.isAdd]
     * If false, edit or file a contact report.
     * @param {Boolean} [options.isStep]
     * If false, interaction.
     * @param {Boolean} [options.fileContactReport]
     * @param {Boolean} [options.siteRequired]
     * @param {Boolean} [options.selectedSite]
     * @param {Object[]} [options.sites]
     * @param {String} options.sites.id
     * @param {String} options.sites.name
     *
     * @param {String} [options.stepInfo]
     * Info about the step that is being edited.
     * @param {String} [options.stepInfo.contactMethod]
     * @param {String} options.stepInfo.objective
     * @param {String} [options.stepInfo.planName]
     *
     */
    function setInitialState(options) {

        options = options || {};

        var isStep = !!options.isStep,
            isStewardshipStep = !!options.isStewardshipStep,
            fileContactReport = !!options.fileContactReport,
            stepInfo = options.stepInfo || {};

        state.showPlanOptions = isStep;
        state.showSubcategory = !isStewardshipStep;
        state.showLocation = !isStewardshipStep;
        state.displayParticipants = !isStewardshipStep;
        state.displaySolicitors = isStep;
        state.displayComments = !isStewardshipStep;
        state.displaySite = !isStep;
        state.siteRequired = options.siteRequired;
        state.selectedSite = options.selectedSite;
        state.sites = options.sites;
        state.selectedActionOption = null;

        if (stepInfo.planName) {
            state.planName = stepInfo.planName;
        }

        state.contactMethod = stepInfo.contactMethod;
        state.objective = stepInfo.objective;

        // This needs to be a javascript Date object rather than a moment to be used for HTML input fields.
        state.stepDate = new Date();

        if (fileContactReport) {
            state.modalHeader = "File contact report";
            state.showPlanOptions = !!stepInfo.planName;
            state.commentsRequired = true;
            state.showOtherActionOptions = true;
        } else {

            if (isStep) {
                state.modalHeader = "Add a step";
                state.showPlanOptions = true;
                state.choosePlan = true;
                state.allowStatusChange = true;
            } else {
                state.modalHeader = "Add an interaction";
                state.contactMethodRequired = true;
                state.allowStatusChange = true;
            }

        }

    }

    /**
     * @private
     *
     * @param {Object} otherActions
     *
     * @param {Boolean} [expectedState.isStep]
     * If false, interaction.
     * @param {Boolean} [expectedState.fileContactReport]
     *
     * @param {String} [expectedState.stepInfo]
     * Info about the step that is being edited.
     * @param {String} [expectedState.stepInfo.contactMethod]
     * @param {String} expectedState.stepInfo.objective
     * @param {String} [expectedState.stepInfo.planName]
     *
     * @param {Boolean} [expectedState.hasExistingIncompleteSteps]
     * @param {Boolean} [expectedState.hasExistingIncompleteInteractions]
     * @param {Boolean} [expectedState.hasPlans]
     *
     */
    function checkOtherActionsSection(otherActions, expectedState) {

        var defaultAction = otherActions.find("[bb-frog-testid='defaultAction']"),
            defaultStep = otherActions.find("[bb-frog-testid='defaultStep']"),
            defaultStepPlan = otherActions.find("[bb-frog-testid='defaultStepPlan']"),
            defaultStepNoPlan = otherActions.find("[bb-frog-testid='defaultStepNoPlan']"),
            expectedDefaultText,
            expectedStepText;

        if (!expectedState.fileContactReport) {
            expect(otherActions).not.toExist();
        } else {
            expect(otherActions).toExist();

            expectedDefaultText = "We've defaulted this contact report to complete this step assigned to you:";
            expect(defaultStep).toExist();
            expectedState.stepInfo.contactMethod = expectedState.stepInfo.contactMethod || ""; // don't let it put "undefined"
            expectedState.stepInfo.objective = expectedState.stepInfo.objective || "";

            if (expectedState.stepInfo.contactMethod) {
                expectedStepText = expectedState.stepInfo.contactMethod + " - " + expectedState.stepInfo.objective;
            } else {
                expectedStepText = expectedState.stepInfo.objective;
            }

            expect(defaultStep.text().trim()).toBe(expectedStepText);

            expect(defaultAction.text().trim()).toBe(expectedDefaultText);

            if (expectedState.isStep) {
                expect(defaultStepPlan).toExist();
                expect(defaultStepPlan.text().trim()).toBe(expectedState.stepInfo.planName);
                expect(defaultStepNoPlan).not.toExist();
            } else {
                expect(defaultStepPlan).not.toExist();
                expect(defaultStepNoPlan).toExist();
            }
        }

    }

    /**
     * @private
     *
     * @param {Object} fieldSection
     *
     * @param {Object} expectedState
     *
     * @param {Boolean} [expectedState.isStep]
     * If false, interaction.
     * @param {Boolean} [expectedState.fileContactReport]
     *
     * @param {String} [expectedState.stepInfo]
     * Info about the step that is being edited.
     * @param {String} expectedState.stepInfo.objective
     *
     * @param {String} [expectedState.selectedCategory]
     * @param {Boolean} [expectedState.isStewardshipStep]
     * @param {Boolean} [expectedState.siteRequired]
     * @param {String} [expectedState.selectedSite]
     *
     */
    function checkFieldSection(fieldSection, expectedState) {

        var contactMethodField = fieldSection.find("[bb-frog-testid='contactMethodField']"),
            status = fieldSection.find("[bb-frog-testid='status']"),
            comments = fieldSection.find("[bb-frog-testid='comments']"),
            commentsField = fieldSection.find("[bb-frog-testid='commentsField']"),
            planStage = fieldSection.find("[bb-frog-testid='planStage']"),
            subcategory = fieldSection.find("[bb-frog-testid='subcategory']"),
            subcategoryField = fieldSection.find("[bb-frog-testid='subcategoryField']"),
            location = fieldSection.find("[bb-frog-testid='location']"),
            otherLocation = fieldSection.find("[bb-frog-testid='otherLocation']"),
            otherLocationField = fieldSection.find("[bb-frog-testid='otherLocationField']"),
            site = fieldSection.find("[bb-frog-testid='site']"),
            participants = fieldSection.find("[bb-frog-testid='participants']"),
            solicitors = fieldSection.find("[bb-frog-testid='solicitors']"),
            siteControl = fieldSection.find("[bb-frog-testid='siteControl']");

        expect(fieldSection).toExist();

        testUtils.checkFieldRequired(!(expectedState.isStep || expectedState.fileContactReport), fieldSection, contactMethodField);

        if (expectedState.fileContactReport) {
            expect(status).not.toExist();

            if (!expectedState.isStewardshipStep) {
                testUtils.checkFieldRequired(true, fieldSection, commentsField);
            }
        } else {
            expect(status).toExist();
            testUtils.checkFieldRequired(false, fieldSection, commentsField);
        }

        if (expectedState.isStewardshipStep) {
            expect(comments).not.toExist();
            expect(subcategory).not.toExist();
            expect(location).not.toExist();
            expect(otherLocation).not.toExist();
        } else {
            expect(comments).toExist();
            expect(subcategory).toExist();
            expect(location).toExist();
            expect(otherLocation).toExist();

            if (expectedState.selectedCategory) {
                expect(subcategoryField).not.toHaveAttr("disabled", "disabled");
                testUtils.checkFieldRequired(true, fieldSection, subcategoryField);
            } else {
                expect(subcategoryField).toHaveAttr("disabled", "disabled");
                testUtils.checkFieldRequired(false, fieldSection, subcategoryField);
            }

            if (expectedState.selectedLocation) {
                if (expectedState.selectedLocation === OtherLocationId) {
                    expect(otherLocationField).not.toHaveAttr("disabled", "disabled");
                    testUtils.checkFieldRequired(true, fieldSection, otherLocationField);
                } else {
                    expect(otherLocationField).toHaveAttr("disabled", "disabled");
                    testUtils.checkFieldRequired(false, fieldSection, otherLocationField);
                }
            }
        }

        if (expectedState.isStep && !expectedState.isStewardshipStep) {
            expect(planStage).toExist();
        } else {
            expect(planStage).not.toExist();
        }

        if (expectedState.isStep) {
            expect(site).not.toExist();
        } else {
            expect(site).toExist();
            testUtils.checkFieldRequired(expectedState.siteRequired || false, fieldSection, siteControl);

            if (expectedState.selectedSite) {
                expect(siteControl.val()).toBe("string:" + expectedState.selectedSite);
            }
        }

        if (expectedState.isStewardshipStep) {
            expect(participants).not.toExist();
            expect(solicitors).not.toExist();
        } else {
            expect(participants).toExist();
            if (expectedState.isStep) {
                expect(solicitors).toExist();
            } else {
                expect(solicitors).not.toExist();
            }
        }

    }

    /**
     * @private
     *
     * @param {Object} formDOM
     *
     * @param {Object} expectedState
     * @param {Boolean} [expectedState.loading=false]
     * @param {Boolean} [expectedState.saving=false]
     * @param {Boolean} [expectedState.valid=false]
     * @param {Boolean} [expectedState.errorMessage]
     *
     * @param {Boolean} [expectedState.isAdd]
     * If false, edit or file a contact report.
     * @param {Boolean} [expectedState.isStep]
     * If false, interaction.
     * @param {Boolean} [expectedState.fileContactReport]
     *
     * @param {String} expectedState.header
     *
     * @param {String} [expectedState.stepInfo]
     * Info about the step that is being edited.
     * @param {String} [expectedState.stepInfo.contactMethod]
     * @param {String} expectedState.stepInfo.objective
     * @param {String} [expectedState.stepInfo.planName]
     *
     * @param {Boolean} [expectedState.hasExistingIncompleteSteps]
     * @param {Boolean} [expectedState.hasExistingIncompleteInteractions]
     *
     * @param {String} [expectedState.selectedPlan]
     * @param {String} [expectedState.selectedCategory]
     * @param {Boolean} [expectedState.isStewardshipStep]
     * @param {Boolean} [expectedState.siteRequired]
     * @param {Object[]} [expectedState.sites]
     * @param {String} expectedState.sites.id
     * @param {String} expectedState.sites.name
     * @param {String} [expectedState.selectedSite]
     *
     */
    function checkState(formDOM, expectedState) {

        expectedState = expectedState || {};
        expectedState.stepInfo = expectedState.stepInfo || {};

        var header = formDOM.find(HEADER),
            otherActions = formDOM.find(OTHERACTIONS),
            plan = formDOM.find(PLAN),
            fieldSection = formDOM.find(FIELDSECTION),
            errorMessage = formDOM.find(ERRORMESSAGE),
            saveButton = formDOM.find(SAVEBUTTON);

        testUtils.checkHtml(formDOM);

        expect(header).toExist();
        expect(header.text().trim()).toBe(expectedState.header);

        checkOtherActionsSection(otherActions, expectedState);

        if (expectedState.isAdd && expectedState.isStep) {
            expect(plan).toExist();
            if (expectedState.selectedPlan) {
                checkFieldSection(fieldSection, expectedState);
            } else {
                expect(fieldSection).not.toExist();
            }
        } else {
            expect(plan).not.toExist();
            checkFieldSection(fieldSection, expectedState);
        }

        expect(saveButton).toExist();

        if (expectedState.errorMessage) {
            expect(errorMessage).toExist();
            expect(errorMessage.text()).toBe(expectedState.errorMessage);
            expect(saveButton).toHaveAttr("disabled", "disabled");
        } else {
            expect(errorMessage).not.toExist();
            if (expectedState.saving || !expectedState.valid) {
                expect(saveButton).toHaveAttr("disabled", "disabled");
            } else {
                expect(saveButton).not.toHaveAttr("disabled", "disabled");
            }
        }

    }

    beforeEach(function () {

        module("frog.test");
        module("infinity.util");
        module("frog");


    });

    beforeEach(inject(function (_$rootScope_, _$templateCache_, _$compile_, _frogResources_, _testUtils_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $scope.frogResources = _frogResources_;
        testUtils = _testUtils_;
    }));

    beforeEach(function () {

        state = {};
        $scope.locals = {};

    });

    describe("contact report html", function () {

        describe("add step", function () {

            it("has correct initial setting", function () {

                var formDOM,
                    options;

                options = {
                    isAdd: true,
                    isStep: true,
                    header: "Add a step"
                };

                setInitialState(options);

                formDOM = compileFormWithState(state);

                checkState(formDOM, options);

            });

            it("other location is enabled and required", function () {

                var formDOM,
                    options;

                options = {
                    isAdd: true,
                    isStep: true,
                    header: "Add a step"
                };

                setInitialState(options);

                state.selectedLocation = OtherLocationId;

                formDOM = compileFormWithState(state);

                checkState(formDOM, options);
            });

        });

        describe("add interaction", function () {

            it("has correct initial setting", function () {

                var formDOM,
                    options;

                options = {
                    isAdd: true,
                    header: "Add an interaction"
                };

                setInitialState(options);

                formDOM = compileFormWithState(state);

                checkState(formDOM, options);

            });

            it("other location is enabled and required", function () {

                var formDOM,
                    options;

                options = {
                    isAdd: true,
                    header: "Add an interaction"
                };

                setInitialState(options);

                state.selectedLocation = OtherLocationId;

                formDOM = compileFormWithState(state);

                checkState(formDOM, options);
            });

            it("site is required", function () {

                var formDOM,
                    options;

                options = {
                    isAdd: true,
                    header: "Add an interaction",
                    siteRequired: true
                };

                setInitialState(options);

                formDOM = compileFormWithState(state);

                checkState(formDOM, options);

            });

            it("site is defaulted", function () {

                var formDOM,
                    options,
                    sites;

                sites = [{
                    id: "ED8AF80F-4C57-44B7-8C91-CA3452B0DA01",
                    name: "Site 1"
                }];

                options = {
                    isAdd: true,
                    header: "Add an interaction",
                    sites: sites,
                    selectedSite: sites[0].id
                };

                setInitialState(options);

                formDOM = compileFormWithState(state);

                checkState(formDOM, options);

            });

        });

    });

}());
