/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';


    angular.module("frog.frogApi")
    .factory("apiContactReport", ["bbuiShellService", "prospectUtilities", "$rootScope", "$q", "frogResources", "infinityUtilities", 
    function (bbuiShellService, prospectUtilities, $rootScope, $q, frogResources, infinityUtilities) {
        var svc,
            STEP_ADD_ID = '8eab8484-8188-4e63-a514-e08bea349a05',
            STEP_EDIT_ID = '28ae3c5b-a40a-4bd2-ba3a-504f8ab010c8',
            ConstituentIdFieldName = "CONSTITUENTID",
            FundraiserIdFieldName = "FUNDRAISERID",
            ProspectPlanIdFieldName = "PROSPECTPLANID",
            StewardshipPlanIdFieldName = "STEWARDSHIPPLANID",
            InteractionTypeCodeIdFieldName = "INTERACTIONTYPECODEID",
            ObjectiveFieldName = "OBJECTIVE",
            DateFieldName = "DATE",
            StatusCodeFieldName = "STATUSCODE",
            CommentFieldName = "COMMENT",
            ParticipantsFieldName = "PARTICIPANTS",
            InteractionCategoryIdFieldName = "INTERACTIONCATEGORYID",
            InteractionSubcategoryIdFieldName = "INTERACTIONSUBCATEGORYID",
            LocationFieldName = "LOCATION",
            LocationIdFieldName = "LOCATIONID",
            OtherLocationFieldName = "OTHERLOCATION",
            StewardshipCategoryIdFieldName = "STEWARDSHIPCATEGORYID",
            ProspectPlanStatusCodeIdFieldName = "PROSPECTPLANSTATUSCODEID",
            AdditionalSolicitorsFieldName = "ADDITIONALSOLICITORS",
            SiteIdFieldName = "SITEID",
            SiteRequiredFieldName = "SITEREQUIRED",
            PlanTypeFieldName = "PLANTYPE",
            FirstNameFieldName = "FIRSTNAME",
            KeyNameFieldName = "KEYNAME";

        return {
            addStepAsync: addStepAsync,
            editStepAsync: editStepAsync,
            loadStepAsync: loadStepAsync,
            getContactReportPreloadAsync: getContactReportPreloadAsync
        };

        function getTransformedParticipants(participants) {
            var transformedParticipants = [];

            if (participants) {
                participants.forEach(function (participant) {
                    transformedParticipants.push([
                        {
                            name: ConstituentIdFieldName,
                            value: participant.constituentId
                        }
                    ]);
                });
            }

            return transformedParticipants;
        }

        function getTransformedSolicitors(solicitors) {
            var transformedSolicitors = [];

            if (solicitors) {
                solicitors.forEach(function (solicitor) {
                    transformedSolicitors.push([
                        {
                            name: FundraiserIdFieldName,
                            value: solicitor.constituentId
                        }
                    ]);
                });
            }

            return transformedSolicitors;
        }

        /**
      * Add a plan step.
      *
      * @param {Object} step
      * @param {String} step.prospectId
      * @param {String} step.contactMethodId
      * @param {String} step.objective
      * @param {Date} step.date
      * @param {Number} step.statusCode
      * @param {String} step.comments
      * @param {String} step.participants
      * @param {String} step.categoryId
      * @param {String} step.subcategoryId
      * @param {String} step.planStageId
      * @param {String} step.solicitors
      * @param {String} step.planId
      * @param {frog.utils.prospectUtilities.PlanType} step.planType
      * @param {String} step.siteId
      * 
      * @returns {Promise<String>} The ID of the step saved.
      */
        function addStepAsync(step) {
            step = step || {};
            svc = bbuiShellService.create();

            return svc.dataFormSave(
                STEP_ADD_ID,
                {
                    values: [
                        {
                            name: ConstituentIdFieldName,
                            value: step.prospectId
                        },
                        {
                            name: ProspectPlanIdFieldName,
                            value: step.planType === prospectUtilities.PLAN_TYPE.PROSPECT ? step.planId : null
                        },
                        {
                            name: StewardshipPlanIdFieldName,
                            value: step.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.planId : null
                        },
                        {
                            name: InteractionTypeCodeIdFieldName,
                            value: step.contactMethodId
                        },
                        {
                            name: ObjectiveFieldName,
                            value: step.objective
                        },
                        {
                            name: DateFieldName,
                            value: step.date
                        },
                        {
                            name: StatusCodeFieldName,
                            value: step.statusCode
                        },
                        {
                            name: CommentFieldName,
                            value: step.comments
                        },
                        {
                            name: ParticipantsFieldName,
                            collectionValue: getTransformedParticipants(step.participants)
                        },
                        {
                            name: InteractionCategoryIdFieldName,
                            value: step.planType !== prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                        },
                        {
                            name: InteractionSubcategoryIdFieldName,
                            value: step.subcategoryId
                        },
                        {
                            name: LocationIdFieldName,
                            value: step.locationId
                        },
                        {
                            name: OtherLocationFieldName,
                            value: step.otherLocation
                        },
                        {
                            name: StewardshipCategoryIdFieldName,
                            value: step.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                        },
                        {
                            name: ProspectPlanStatusCodeIdFieldName,
                            value: step.planStageId
                        },
                        {
                            name: AdditionalSolicitorsFieldName,
                            collectionValue: getTransformedSolicitors(step.solicitors)
                        },
                        {
                            name: SiteIdFieldName,
                            value: step.siteId
                        }
                    ]
                }
            )
            .then(function (reply) {
                $rootScope.$broadcast("stepSaved");
                return reply.data.id;
            }, function (reply) {
                var error = { message: "" };

                if (reply.data && reply.data.message) {
                    error.message = reply.data.message;
                }

                return $q.reject(error);
            });
        }

        /**
      * Edits an existing plan step or interaction.
      *
      * @param {Object} step
      * @param {String} step.prospectId
      * @param {String} step.contactMethodId
      * @param {String} step.objective
      * @param {Date} step.date
      * @param {Number} step.statusCode
      * @param {String} step.comments
      * @param {String} step.participants
      * @param {String} step.categoryId
      * @param {String} step.subcategoryId
      * @param {String} step.planStageId
      * @param {String} step.solicitors
      * @param {String} step.planId
      * @param {frog.utils.prospectUtilities.PlanType} step.planType
      * 
      * @returns {Promise<String>} The ID of the step saved.
      */
        function editStepAsync(step) {
            step = step || {};
            svc = bbuiShellService.create();

            return svc.dataFormSave(
                STEP_EDIT_ID,
                {
                    recordId: step.id,
                    values: [
                        {
                            name: InteractionTypeCodeIdFieldName,
                            value: step.contactMethodId
                        },
                        {
                            name: ObjectiveFieldName,
                            value: step.objective
                        },
                        {
                            name: DateFieldName,
                            value: step.date
                        },
                        {
                            name: StatusCodeFieldName,
                            value: step.statusCode
                        },
                        {
                            name: CommentFieldName,
                            value: step.comments
                        },
                        {
                            name: ParticipantsFieldName,
                            collectionValue: getTransformedParticipants(step.participants)
                        },
                        {
                            name: InteractionCategoryIdFieldName,
                            value: step.planType !== prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                        },
                        {
                            name: InteractionSubcategoryIdFieldName,
                            value: step.subcategoryId
                        },
                        {
                            name: LocationIdFieldName,
                            value: step.locationId
                        },
                        {
                            name: OtherLocationFieldName,
                            value: step.otherLocation
                        },
                        {
                            name: StewardshipCategoryIdFieldName,
                            value: step.planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP ? step.categoryId : null
                        },
                        {
                            name: ProspectPlanStatusCodeIdFieldName,
                            value: step.planStageId
                        },
                        {
                            name: AdditionalSolicitorsFieldName,
                            collectionValue: getTransformedSolicitors(step.solicitors)
                        }
                    ]
                }
            )
            .then(function (reply) {
                $rootScope.$broadcast("stepSaved");
                return reply.data.id;
            }, function (reply) {
                var error = { message: "" };

                if (reply.data && reply.data.message) {
                    error.message = reply.data.message;
                }

                return $q.reject(error);
            });
        }

        /**
         * Loads an interaction/prospect plan step/stewardship plan step by ID.
         * 
         * @param {String} The id of the interaction/step to load.
         * 
         * @returns {Promise<Object>} The loaded interaction/step.
         * @returns {String} returns.interactionTypeCodeId
         * @returns {String} returns.objective
         * @returns {Date} returns.expectedDate
         * @returns {Number} returns.statusCode
         * @returns {String} returns.comment
         * @returns {String} returns.categoryId
         * @returns {String} returns.subcategoryId
         * @returns {String} returns.prospectPlanStatusCodeId
         * @returns {String} returns.planId
         * @returns {frog.utils.prospectUtilities.PlanType} returns.planType
         * @returns {String} step.siteId
         * 
         * @returns {Object[]} returns.participants
         * @returns {String} returns.participants.id
         * @returns {String} returns.participants.constituentId
         * @returns {String} returns.participants.name
         * 
         * @returns {Object[]} returns.solicitors
         * @returns {String} returns.solicitors.constituentId
         * @returns {String} returns.solicitors.name
         */
        function loadStepAsync(id) {
            svc = bbuiShellService.create();
            return svc.dataFormLoad(STEP_EDIT_ID, {
                recordId: id
            })
            .then(function (reply) {
                var result = {
                    comment: "",
                    date: null,
                    interactionCategoryId: null,
                    interactionSubcategoryId: null,
                    interactionTypeCodeId: null,
                    location: "",
                    objective: "",
                    participants: [],
                    prospectPlanStatusCodeId: null,
                    solicitors: [],
                    statusCode: null,
                    stewardshipCategoryId: null
                };

                reply.data.values.forEach(function (dfi) {
                    switch (dfi.name) {
                        case InteractionTypeCodeIdFieldName:
                            result.interactionTypeCodeId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                            break;

                        case ObjectiveFieldName:
                            result.objective = dfi.value;
                            break;

                        case DateFieldName:
                            result.date = dfi.value;
                            break;

                        case StatusCodeFieldName:
                            result.statusCode = dfi.value;
                            break;

                        case CommentFieldName:
                            result.comment = dfi.value;
                            break;

                        case ParticipantsFieldName:
                            angular.forEach(dfi.value, function (participantDfi) {
                                var participant = {},
                                    firstName,
                                    keyName;

                                angular.forEach(participantDfi, function (field) {
                                    switch (field.name) {
                                        case ConstituentIdFieldName:
                                            participant.constituentId = field.value.toUpperCase();
                                            break;

                                        case FirstNameFieldName:
                                            firstName = field.value;
                                            break;

                                        case KeyNameFieldName:
                                            keyName = field.value;
                                            break;
                                    }
                                });

                                participant.name = prospectUtilities.getFullName(frogResources, firstName, keyName);

                                result.participants.push(participant);
                            });

                            break;

                        case InteractionCategoryIdFieldName:
                            result.categoryId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                            break;

                        case InteractionSubcategoryIdFieldName:
                            result.subcategoryId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                            break;

                        case LocationFieldName:
                            result.location = dfi.value;
                            break;

                        case ProspectPlanStatusCodeIdFieldName:
                            result.prospectPlanStatusCodeId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                            break;

                        case StewardshipCategoryIdFieldName:
                            result.stewardshipCategoryId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                            break;

                        case AdditionalSolicitorsFieldName:
                            angular.forEach(dfi.value, function (participantDfi) {
                                var solicitor = {},
                                    firstName,
                                    keyName;

                                angular.forEach(participantDfi, function (field) {
                                    switch (field.name) {
                                        case FundraiserIdFieldName:
                                            solicitor.constituentId = field.value.toUpperCase();
                                            break;

                                        case FirstNameFieldName:
                                            firstName = field.value;
                                            break;

                                        case KeyNameFieldName:
                                            keyName = field.value;
                                            break;
                                    }
                                });

                                solicitor.name = prospectUtilities.getFullName(frogResources, firstName, keyName);

                                result.solicitors.push(solicitor);
                            });

                            break;

                        case PlanTypeFieldName:
                            result.planType = dfi.value;
                            break;
                    }
                });

                return result;
            }, function (reply) {
                var error = { message: "" };

                if (reply.data && reply.data.message) {
                    error.message = reply.data.message;
                }

                return $q.reject(error);
            });
        }

        /**
      * Preload data for the contact report form.
      * @returns {Promise<Object>}
      * @returns {Boolean} returns.siteRequired Specifies whether or not a site is required for the user.
      * @returns {String} returns.siteId The default site for the user.
      */
        function getContactReportPreloadAsync() {
            svc = bbuiShellService.create();
            return svc.dataFormLoad(STEP_ADD_ID)
                .then(function (reply) {
                    var result = {
                        siteRequired: false,
                        siteId: null
                    };

                    reply.data.values.forEach(function (dfi) {
                        switch (dfi.name) {
                            case SiteRequiredFieldName:
                                result.siteRequired = dfi.value;
                                break;

                            case SiteIdFieldName:
                                result.siteId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                break;
                        }
                    });

                    return result;
                }, function (reply) {
                    var error = { message: "" };

                    if (reply.data && reply.data.message) {
                        error.message = reply.data.message;
                    }

                    return $q.reject(error);
                });
        }

    }]);

}());