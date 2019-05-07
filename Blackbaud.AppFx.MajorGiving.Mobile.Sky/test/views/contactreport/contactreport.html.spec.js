/*

TODO tests that should be written

 Header shows correct text
 Form submit action calls correct function

 Default action section:
   Shows only for file a contact report
   "We've defaulted this contact report to complete this * assigned to you:" text is correct
   Objective appears correctly with contact method
   Objective appears correctly without contact method
   Plan title appears correctly
   No plan appears correctly
   "I want to do something else" is not selectable (not 100% sure on this - I think on iPhone that means if you click the dropdown you HAVE to select something so maybe that's not the best option. Either way write a test that tests the behavior we want.)
   Dropdown selection for "I want to do something else" triggers appropriate response

 Plan dropdown exists/does not exist when appropriate
 Contains blank value to start which disappears on selection
 Dropdown contains correct values
 Selecting a plan sets the correct selected value
 The rest of the fields are hidden until a plan is selected

 Contact method is required when appropriate
 Contains blank value which does not disappear on selection
 Dropdown contains correct values
 Selecting a contact method sets the correct selected value
 Deselecting a contact method sets the correct selected value

 Setting objective text sets the correct value in the model

 Status exists/does not exist when appropriate
 Contains blank value to start which disappears on selection
 Dropdown contains correct values
 Selecting a status sets the correct selected value

 Comments field exists/does not exist when appropriate
 Setting comments text sets the correct value in the model
 Comments field is required when appropriate

 Setting date sets the correct value in the model

 Setting time sets the correct value in the model

 Plan stage exists/does not exist when appropriate
 Contains blank value to start which disappears on selection
 Dropdown contains correct values
 Selecting a stage sets the correct selected value

 Category dropdown contains correct values
 Contains blank value which does not disappear on selection
 Selecting a category sets the correct selected value
 Deselecting a category sets the correct selected value

 Subcategory dropdown exists/does not exist when appropriate
 Subcategory dropdown contains correct values
 Contains blank value which does not disappear on selection
 Selecting a subcategory sets the correct selected value
 Deselecting a subcategory sets the correct selected value
 Field is disabled when category is not selected
 Field is enabled and required when category is selected

 Site field exists/does not exist when appropriate
 Contains blank value which does not disappear on selection
 Selecting a site sets the correct selected value
 Deselecting a site sets the correct selected value

 Participants dropdown exists/does not exist when appropriate
 Selecting participants sets the correct selected value
 Clearing participants sets the correct selected value
 Clicking field triggers appropriate action
 Select field text is correct
 Select header text is correct

 Solicitors field exists/does not exist when appropriate
 Selecting solicitors sets the correct selected value
 Clearing solicitors sets the correct selected value
 Clicking field triggers appropriate action
 Select field text is correct
 Select header text is correct

 Error text is shown when appropriate
 Save button is disabled when form is not valid (not sure if you want a separate check for each possible required field)
 Save button is disabled when form is saving
 Save button causes form to wait (TODO - this is not done)

*/

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
            //otherAction = otherActions.find("[bb-frog-testid='otherAction']"),
            expectedDefaultText,
            expectedStepText;

        if (!expectedState.fileContactReport) {
            expect(otherActions).not.toExist();
        } else {
            expect(otherActions).toExist();

            // TODO remove this section START
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
            // TODO remove this section END

            // TODO uncomment this section START
            //if (expectedState.stepInfo.objective) {

            //    expectedDefaultText = "We've defaulted this contact report to complete this {0} assigned to you:";
            //    if (expectedState.isStep) {
            //        expectedDefaultText = expectedDefaultText.format("step");
            //    } else {
            //        expectedDefaultText = expectedDefaultText.format("interaction");
            //    }

            //    expect(defaultStep).toExist();

            //    expectedStepText = expectedState.stepInfo.objective;
            //    if (expectedState.stepInfo.contactMethod) {
            //        expectedStepText = expectedState.stepInfo.contactMethod + " - " + expectedStepText;
            //    }
            //    expect(defaultStep.text().trim()).toBe(expectedStepText);

            //} else {

            //    expectedDefaultText = "We've defaulted this contact report to add a new completed {0} for you:";
            //    if (expectedState.isStep) {
            //        expectedDefaultText = expectedDefaultText.format("step to this plan");
            //    } else {
            //        expectedDefaultText = expectedDefaultText.format("interaction");
            //    }

            //    expect(defaultStep).not.toExist();

            //}

            //if (expectedState.hasExistingIncompleteSteps) {
            //    // expect completeExistingStep value to exist in dropdown
            //} else {
            //    // expect completeExistingStep value not to exist in dropdown
            //}

            //if (expectedState.hasExistingIncompleteInteractions) {
            //    // expect completeExistingInteraction value to exist in dropdown
            //} else {
            //    // expect completeExistingInteraction value not to exist in dropdown
            //}

            //if (expectedState.hasPlans) {
            //    // expect addCompletedStep value to exist in dropdown
            //} else {
            //    // expect addCompletedStep value not to exist in dropdown
            //}

            // TODO uncomment this section END

            expect(defaultAction.text().trim()).toBe(expectedDefaultText);

            if (expectedState.isStep) {
                expect(defaultStepPlan).toExist();
                expect(defaultStepPlan.text().trim()).toBe(expectedState.stepInfo.planName);
                expect(defaultStepNoPlan).not.toExist();
            } else {
                expect(defaultStepPlan).not.toExist();
                expect(defaultStepNoPlan).toExist();
            }

            // TODO check all other action options
            // TODO check localized resource strings when file is localized

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

        // TODO: Handle fileContactReport
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
     * TODO do something while loading
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

        // TODO: add proper unit test for file contact report
        //describe("file contact report", function () {

        //    it("has correct initial setting", function () {
        //        var formDOM,
        //            options;

        //        options = {
        //            fileContactReport: true,
        //            header: "File contact report"
        //        };

        //        setInitialState(options);
        //        formDOM = compileFormWithState(state);
        //        checkState(formDOM, options);
        //    });

        //});

    });

}());
