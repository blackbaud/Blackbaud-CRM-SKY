/*global angular */

(function () {
    'use strict';

    angular.module("frog.util")
    .factory('searchStorage', function () {
        return {
            showInput: true,
            savedInput: {},
            prospects: []
        };
    })
    
    /**
     * @class frog.util.prospectUtilities
     */
    .factory("prospectUtilities", ["frogResources", "bbMoment", function (frogResources, bbMoment) {

        var getToday,
            PLAN_TYPE,
            ProspectIdRequiredMessage = "prospectId is required";

        /**
         * @enum {Number} PlanType
         */
        PLAN_TYPE = {
            /**
             */
            NONE: 0,
            /**
             */
            PROSPECT: 1,
            /**
             */
            STEWARDSHIP: 2
        };

        // Wrap this so that the today variable is not accessible in scope to other functions.
        getToday = (function () {

            var today;

            return function () {
                if (!today) {
                    today = bbMoment();
                    // convert to earliest time 
                    today = bbMoment([today.year(), today.month(), today.date()]);
                }
                return today;
            };

        })();

        /**
         * Get the next step text and label class.
         *
         * @param {Date|String|Number[]|Moment} [nextStepDate]
         *
         * @return {Object}
         * @return {String} return.text
         * @return {String} return.labelClass
         */
        function getNextStepInfo(nextStepDate) {

            var daysToNextStep,
                result = {};

            if (nextStepDate) {
                nextStepDate = bbMoment(nextStepDate);
                nextStepDate = bbMoment([nextStepDate.year(), nextStepDate.month(), nextStepDate.date()]);
                daysToNextStep = Math.ceil(nextStepDate.diff(getToday(), "days", true));
            } else {
                nextStepDate = null;
                daysToNextStep = null;
            }

            if (daysToNextStep < 0) {
                result.text = frogResources.nextstep_pastdue;
                result.labelClass = "label-danger";
            } else {
                switch (daysToNextStep) {
                    case 0:
                        result.text = frogResources.nextstep_today;
                        result.labelClass = "label-warning";
                        break;

                    case 1:
                        result.text = frogResources.nextstep_tomorrow;
                        result.labelClass = "label-info";
                        break;

                    case 2:
                        result.text = frogResources.nextstep_twodays;
                        result.labelClass = "label-info";
                        break;

                    case 3:
                        result.text = frogResources.nextstep_threedays;
                        result.labelClass = "label-info";
                        break;

                    default:
                        if (nextStepDate) {
                            result.text = nextStepDate.format("l");
                        }
                }
            }

            return result;

        }

        /**
         * Set up the prospects with any additional information needed.
         * This will add the properties `nextStep` and `labelClass` where
         * appropriate.
         *
         * @param {Object[]} prospects
         * @param {Date|String|Number[]|Moment} [prospects.nextStepDate]
         */
        function setUp(prospects) {

            prospects = prospects || [];

            prospects.forEach(function (prospect) {

                var nextStepInfo = getNextStepInfo(prospect.nextStepDate);

                prospect.nextStep = nextStepInfo.text || frogResources.portfolio_nextstep_none;
                if (nextStepInfo.labelClass) {
                    prospect.labelClass = nextStepInfo.labelClass;
                }

            });

        }

        function getFullName(frogResources, firstName, keyName) {
            if (firstName) {
                return frogResources.name_format.format(firstName, keyName);
            }
    
            return keyName;
        }

        function requestFailure(reply, failureCallback) {
            var result = {};
    
            if (reply && reply.data && reply.data.message) {
                result.message = reply.data.message;
            }
    
            failureCallback(result);
        }

        return {
            setUp: setUp,
            getNextStepInfo: getNextStepInfo,
            PLAN_TYPE: PLAN_TYPE,
            getFullName: getFullName,
            ProspectIdRequiredMessage: ProspectIdRequiredMessage,
            requestFailure: requestFailure
        };

    }]);

}());
