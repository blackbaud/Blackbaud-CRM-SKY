/*jshint jasmine: true */
/*globals module, inject, angular, $ */

(function () {
    'use strict';

    var $scope,
        $rootScope,
        $templateCache,
        $compile,
        bbMoment,
        testUtils,

        state,

        template = "views/prospects/tiles/upcomingsteps.html",

        ADDSTEPBUTTON = "[bb-frog-testid='addStepButton']",
        ADDINTERACTIONBUTTON = "[bb-frog-testid='addInteractionButton']",
        UPCOMINGSTEPSTILE = "[bb-frog-testid='upcomingStepsTile']",
        UPCOMINGSTEPSSUCCESS = "[bb-frog-testid='upcomingStepsSuccess']",
        UPCOMINGSTEPSERROR = "[bb-frog-testid='upcomingStepsError']",
        ERRORMESSAGE = "[bb-frog-testid='errorMessage']",
        STEPS = "[bb-frog-testid='steps']",
        EMPTY = "[bb-frog-testid='empty']",
        COMMENTS = "[bb-frog-testid='comments']",
        CONTACTMETHOD = "[bb-frog-testid='contactMethod']",
        OBJECTIVE = "[bb-frog-testid='objective']",
        DATE = "[bb-frog-testid='date']",
        PLANNAME = "[bb-frog-testid='planName']",
        NOPLAN = "[bb-frog-testid='noPlan']";

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
     * @param {Object} actualStep
     *
     * @param {Object} expectedStep
     * @param {String} [expectedStep.contactMethod]
     * @param {String} expectedStep.objective
     * @param {Object} expectedStep.date
     * @param {String} [expectedStep.planName]
     * @param {String} [expectedStep.comments]
     *
     */
    function checkStep(actualStep, expectedStep) {

        var comments = actualStep.find(COMMENTS),
            contactMethod = actualStep.find(CONTACTMETHOD),
            objective = actualStep.find(OBJECTIVE),
            date = actualStep.find(DATE),
            planName = actualStep.find(PLANNAME),
            noPlan = actualStep.find(NOPLAN);

        expect(expectedStep.objective).toBeDefined("Invalid test - need step objective");
        expect(expectedStep.date).toBeDefined("Invalid test - need step date");

        if (expectedStep.contactMethod) {
            expect(contactMethod).toExist();
            expect(contactMethod.text()).toBe(expectedStep.contactMethod + " - ");
        } else {
            expect(contactMethod).not.toExist();
        }

        expect(objective).toExist();
        expect(objective.text()).toBe(expectedStep.objective);

        expect(date).toExist();
        expect(date.text()).toBe(bbMoment(expectedStep.date).format("l") + " | ");

        if (expectedStep.planName) {
            expect(planName).toExist();
            expect(planName.text()).toBe(expectedStep.planName);
            expect(noPlan).not.toExist();
        } else {
            expect(planName).not.toExist();
            expect(noPlan).toExist();
            expect(noPlan.text()).toBe("No plan");
        }

        if (expectedStep.comments) {
            expect(comments).toExist();
        } else {
            expect(comments).not.toExist();
        }

    }

    /**
     * @private
     *
     * @param {Object} formDOM
     *
     * @param {Object} expectedState
     * @param {Boolean} [expectedState.loading=false]
     * @param {Boolean} [expectedState.errorMessage]
     *
     * @param {Object[]} [expectedState.steps]
     * @param {String} [expectedState.steps.contactMethod]
     * @param {String} expectedState.steps.objective
     * @param {Object} expectedState.steps.date
     * @param {String} [expectedState.steps.planName]
     * @param {String} [expectedState.steps.comments]
     *
     */
    function checkState(formDOM, expectedState) {

        var upcomingStepsTile = formDOM.find(UPCOMINGSTEPSTILE),
            upcomingStepsSuccess = formDOM.find(UPCOMINGSTEPSSUCCESS),
            upcomingStepsError = formDOM.find(UPCOMINGSTEPSERROR),
            errorMessage = formDOM.find(ERRORMESSAGE),
            steps = formDOM.find(STEPS),
            empty = formDOM.find(EMPTY),
            wait = upcomingStepsTile.find(".blockUI"),
            stepsList = steps.find("[data-bbauto-index]"),
            addStepButton = formDOM.find(ADDSTEPBUTTON),
            addInteractionButton = formDOM.find(ADDINTERACTIONBUTTON),
            i;

        expectedState.steps = expectedState.steps || [];

        testUtils.checkHtml(formDOM);

        expect(upcomingStepsTile).toExist();

        if (expectedState.errorMessage) {
            expect(upcomingStepsSuccess).not.toExist();
            expect(upcomingStepsError).toExist();
            expect(errorMessage.text().trim()).toBe(expectedState.errorMessage);
        } else {
            expect(upcomingStepsError).not.toExist();

            if (expectedState.loading) {
                expect(wait).toExist();
                expect(wait).toBeVisible();
            } else {

                expect(upcomingStepsSuccess).toExist();

                expect(wait).not.toExist();

                expect(addStepButton).toExist();
                expect(addInteractionButton).toExist();

                if (expectedState.grantedInteractionOrStepAddForm) {
                    expect(addStepButton).not.toHaveAttr("disabled");
                    expect(addInteractionButton).not.toHaveAttr("disabled");
                } else {
                    expect(addStepButton).toHaveAttr("disabled");
                    expect(addInteractionButton).toHaveAttr("disabled");
                }

                if (expectedState.steps.length > 0) {

                    expect(steps).toExist();
                    expect(empty).not.toExist();

                    expect(stepsList.length).toBe(expectedState.steps.length);

                    for (i = 0; i < stepsList.length; ++i) {
                        checkStep($(stepsList[i]), expectedState.steps[i]);
                    }

                } else {
                    expect(steps).not.toExist();
                    expect(empty).toExist();
                    expect(empty.find(".bb-no-records").text()).toBe("No steps/interactions found");
                }

            }

        }

    }

    beforeEach(function () {
        module("frog.test");
        module("frog");
    });

    beforeEach(inject(function (_$rootScope_, _$templateCache_, _$compile_, _frogResources_, _bbMoment_, _testUtils_) {
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        $templateCache = _$templateCache_;
        $compile = _$compile_;
        $scope.frogResources = _frogResources_;
        $scope.bbMoment = bbMoment = _bbMoment_;
        testUtils = _testUtils_;
    }));

    beforeEach(function () {

        state = {};
        $scope.locals = {};

    });

    describe('upcoming steps html', function () {

        it('displays correctly when error exists', function () {

            var formDOM;

            state.loading = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                loading: true
            });

            $scope.locals.loadError = "Test error 1";

            $rootScope.$digest();

            checkState(formDOM, {
                errorMessage: "Test error 1"
            });

        });

        it('displays correctly when loading', function () {

            var formDOM;

            state.loading = true;

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                loading: true
            });

        });

        it('displays correctly when there are no steps', function () {

            var formDOM;

            state.upcomingSteps = [];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                steps: []
            });

        });

        it('displays correctly when a step has all of the possible information', function () {

            var formDOM;

            state.upcomingSteps = [
                {
                    contactMethod: "Email",
                    objective: "Email about proposal",
                    date: bbMoment().subtract(1),
                    planName: "Robert's Major Giving Plan",
                    comments: "Sent the email to Robert. He acknowledged his receipt."
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                steps: state.upcomingSteps
            });

        });

        it('displays correctly when a step has minimal information', function () {

            var formDOM;

            state.upcomingSteps = [
                {
                    objective: "Email about proposal",
                    date: bbMoment().subtract(1)
                }
            ];

            formDOM = compileFormWithState(state);

            checkState(formDOM, {
                steps: state.upcomingSteps
            });

        });

        it('disables add step and interaction buttons when user does not have rights', function () {
            var formDom;

            state.grantedInteractionOrStepAddForm = false;
            state.upcomingSteps = [];
            formDom = compileFormWithState(state);

            checkState(formDom, {
                grantedInteractionOrStepAddForm: state.grantedInteractionOrStepAddForm,
                steps: state.upcomingSteps
            });
        });

        it('enables add step and interaction buttons when user has rights', function () {
            var formDom;

            state.grantedInteractionOrStepAddForm = true;
            state.upcomingSteps = [];
            formDom = compileFormWithState(state);

            checkState(formDom, {
                grantedInteractionOrStepAddForm: state.grantedInteractionOrStepAddForm,
                steps: state.upcomingSteps
            });
        });

    });

}());
