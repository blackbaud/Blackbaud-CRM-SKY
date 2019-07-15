/*jshint jasmine: true */
/*globals module, inject */

(function () {
    'use strict';

    describe('utils.prospects', function () {

        var prospectUtilities,
            bbMoment;

        beforeEach(function () {

            module('frog.resources');

            module('sky.moment');

            module('frog.util');

            module('infinity.util');

        });

        beforeEach(inject(function (_prospectUtilities_, _bbMoment_) {
            prospectUtilities = _prospectUtilities_;
            bbMoment = _bbMoment_;
        }));

        it("factory exists", function () {
            expect(prospectUtilities).toBeDefined("factory not defined");
        });

        describe("setUp", function () {

            describe("parameter validation", function () {

                it("works with missing parameters", function () {

                    // expect something so Chutzpah doesn't complain.
                    // Really we are just testing that this doesn't cause an exception.
                    expect(prospectUtilities.setUp()).not.toBeDefined();

                });

                it("works with null parameters", function () {

                    var prospects = null;

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toBe(null);

                });

                it("works with empty parameters", function () {

                    var prospects = [];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual([]);

                });

                it("works with empty prospect", function () {

                    var prospects = [
                        {}
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual([
                        {
                            nextStep: "No step"
                        }
                    ]);

                });

            });

            describe("sets the appropriate properties", function () {

                it("for past due steps", function () {

                    var prospects,
                        expected,
                        daysToNextStep = -30,
                        nextStepDate = bbMoment().add(daysToNextStep, "days");

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "Past due",
                            labelClass: "label-danger"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("for today's steps", function () {

                    var prospects,
                        expected,
                        daysToNextStep = 0,
                        nextStepDate = bbMoment().add(daysToNextStep, "days");

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("for tomorrow's steps", function () {

                    var prospects,
                        expected,
                        daysToNextStep = 1,
                        nextStepDate = bbMoment().add(daysToNextStep, "days");

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "Tomorrow",
                            labelClass: "label-info"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("for steps 2 days from today", function () {

                    var prospects,
                        expected,
                        daysToNextStep = 2,
                        nextStepDate = bbMoment().add(daysToNextStep, "days");

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "2 days",
                            labelClass: "label-info"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("for steps 3 days from today", function () {

                    var prospects,
                        expected,
                        daysToNextStep = 3,
                        nextStepDate = bbMoment().add(daysToNextStep, "days");

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "3 days",
                            labelClass: "label-info"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("for steps in the future", function () {

                    var prospects,
                        expected,
                        daysToNextStep = 4,
                        nextStepDate = bbMoment().add(daysToNextStep, "days");

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: nextStepDate.format("l")
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("for a prospect with no next step", function () {

                    var prospects,
                        expected;

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da"
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStep: "No step"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

            });

            describe("works properly with time differences", function () {

                it("when next step is last second of the day", function () {

                    var prospects,
                        expected,
                        nextStepDate = bbMoment();

                    nextStepDate = bbMoment([nextStepDate.year(), nextStepDate.month(), nextStepDate.date(), 23, 59, 59, 999]);

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "Today",
                            labelClass: "label-warning"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

                it("when next step is first second of the day", function () {

                    var prospects,
                        expected,
                        nextStepDate = bbMoment().add(1, "days");

                    nextStepDate = bbMoment([nextStepDate.year(), nextStepDate.month(), nextStepDate.date(), 0, 0, 0, 0]);

                    prospects = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate
                        }
                    ];

                    expected = [
                        {
                            name: "Paul McCartney",
                            id: "08172a24-fba4-49ea-b7d2-f32d810343da",
                            nextStepDate: nextStepDate,
                            nextStep: "Tomorrow",
                            labelClass: "label-info"
                        }
                    ];

                    prospectUtilities.setUp(prospects);

                    expect(prospects).toEqual(expected);

                });

            });

        });

        describe("getNextStepInfo", function () {

            describe("parameter validation", function () {

                it("works with missing parameters", function () {
                    expect(prospectUtilities.getNextStepInfo()).toEqual({});
                });

                it("works with null parameter", function () {

                    var input = null,
                        result,
                        expected = {};

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("works with empty parameter", function () {

                    var input = "",
                        result,
                        expected = {};

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

            });

            describe("sets the appropriate properties", function () {

                it("for past due steps", function () {

                    var daysToNextStep = -30,
                        input = bbMoment().add(daysToNextStep, "days"),
                        result,
                        expected;

                    expected = {
                        text: "Past due",
                        labelClass: "label-danger"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("for today's steps", function () {

                    var daysToNextStep = 0,
                        input = bbMoment().add(daysToNextStep, "days"),
                        result,
                        expected;

                    expected = {
                        text: "Today",
                        labelClass: "label-warning"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("for tomorrow's steps", function () {

                    var daysToNextStep = 1,
                        input = bbMoment().add(daysToNextStep, "days"),
                        result,
                        expected;

                    expected = {
                        text: "Tomorrow",
                        labelClass: "label-info"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("for steps 2 days from today", function () {

                    var daysToNextStep = 2,
                        input = bbMoment().add(daysToNextStep, "days"),
                        result,
                        expected;

                    expected = {
                        text: "2 days",
                        labelClass: "label-info"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("for steps 3 days from today", function () {

                    var daysToNextStep = 3,
                        input = bbMoment().add(daysToNextStep, "days"),
                        result,
                        expected;

                    expected = {
                        text: "3 days",
                        labelClass: "label-info"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("for steps in the future", function () {

                    var daysToNextStep = 4,
                        input = bbMoment().add(daysToNextStep, "days"),
                        result,
                        expected;

                    expected = {
                        text: input.format("l")
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

            });

            describe("works properly with time differences", function () {

                it("when next step is last second of the day", function () {

                    var input = bbMoment(),
                        result,
                        expected;

                    input = bbMoment([input.year(), input.month(), input.date(), 23, 59, 59, 999]);

                    expected = {
                        text: "Today",
                        labelClass: "label-warning"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

                it("when next step is first second of the day", function () {

                    var input = bbMoment(),
                        result,
                        expected;

                    input = bbMoment([input.year(), input.month(), input.date(), 0, 0, 0, 0]);

                    expected = {
                        text: "Today",
                        labelClass: "label-warning"
                    };

                    result = prospectUtilities.getNextStepInfo(input);

                    expect(result).toEqual(expected);

                });

            });

        });

    });

}());
