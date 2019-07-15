/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    angular.module("frog.api")
        .factory("apiContactReport", ["bbuiShellService", "infinityUtilities", "prospectUtilities", "$rootScope", "$q", "frogResources",
            function (bbuiShellService, infinityUtilities, prospectUtilities, $rootScope, $q, frogResources) {
            var svc,
                StepAddId = "8eab8484-8188-4e63-a514-e08bea349a05",
                StepEditId = "28ae3c5b-a40a-4bd2-ba3a-504f8ab010c8",
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

            /**
             * Transform a list of participants into a standard list that controllers can use.
             * 
             * @param {Object[]} participants participants
             * @param {String} participants.constituentId The system ID of the participant.
             * 
             * @returns {Object[]} transformedParticipants
             * @returns {String} transformedParticipants.name The FieldId to use. Hard-coded to "CONSTITUENTID."
             * @returns {String} transformedParticipants.value The system ID of the particpant.
             */
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

            /**
             * Transform a list of solicitors into a standard list that controllers can use.
             * 
             * @param {Object[]} solicitors solicitors
             * @param {String} solicitors.constituentId The system ID of the solicitor.
             * 
             * @returns {Object[]} transformedSolicitors
             * @returns {String} transformedSolicitors.name The FieldId to use. Hard-coded to "FUNDRAISERID."
             * @returns {String} transformedSolicitors.value The system ID of the solicitor.
             */
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
             * Add a step to a prospect/stewardship plan.
             *
             * @param {Object} step step
             * @param {String} step.prospectId The system ID of the prospect.
             * @param {String} step.contactMethodId The system ID for the contact method to be used.
             * @param {String} step.objective The step's objective.
             * @param {Date} step.date The step's date.
             * @param {Number} step.statusCode The step's status code.
             * @param {String} step.comments The comments on the step.
             * @param {Object[]} step.participants participants on the step
             * @param {String} step.participants.constituentId The system ID of the participant.
             * @param {String} step.categoryId The category of the step.
             * @param {String} step.subcategoryId The subcategory of the step.
             * @param {String} step.planStageId The system ID for the plan stage.
             * @param {Object[]} step.solicitors solicitors on the step
             * @param {String} step.solicitors.constituentId The system ID of the solicitor.
             * @param {String} step.planId The system ID to which to add the step.
             * @param {frog.utils.prospectUtilities.PlanType} step.planType The plan type.
             * @param {String} step.siteId The system ID for the step's site.
             * 
             * @returns {Promise<String>} The ID of the step saved.
             */
            function addStepAsync(step) {
                step = step || {};
                svc = bbuiShellService.create();

                return svc.dataFormSave(
                    StepAddId,
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
             * Edit an existing prospect/stewardship plan step or interaction.
             * 
             * @param {Object} step The step
             * @param {String} step.prospectId The system ID of the prospect.
             * @param {String} step.contactMethodId The system ID for the contact method to be used.
             * @param {String} step.objective The step's objective.
             * @param {Date} step.date The step's date.
             * @param {Number} step.statusCode The step's status code.
             * @param {String} step.comments The comments on the step.
             * @param {Object[]} step.participants The participants on the step.
             * @param {String} step.participants.constituentId The system ID of the participant.
             * @param {String} step.categoryId The category of the step.
             * @param {String} step.subcategoryId The subcategory of the step.
             * @param {String} step.planStageId The system ID for the plan stage.
             * @param {Object[]} step.solicitors The solicitors on the step.
             * @param {String} step.solicitors.constituentId The system ID of the solicitor.
             * @param {String} step.planId The system ID to which to add the step.
             * @param {frog.utils.prospectUtilities.PlanType} step.planType The plan type.
             * 
             * @returns {Promise<String>} The ID of the step saved.
             */
            function editStepAsync(step) {
                step = step || {};
                svc = bbuiShellService.create();

                return svc.dataFormSave(
                    StepEditId,
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
             * Loads information associated with a given interaction or a given step for a stewardship or prospect plan.
             * 
             * @param {String} The id of the interaction/step to load.
             * 
             * @returns {Promise<Object>} return The loaded interaction/step.
             * @returns {String} return.interactionTypeCodeId The system ID for the interaction/step type.
             * @returns {String} return.objective The objective of the interaction/step.
             * @returns {Date} return.expectedDate The expected date of the interaction/step.
             * @returns {Number} return.statusCode The status code of the interaction/step.
             * @returns {String} return.comment The comment on the interaction/step.
             * @returns {String} return.categoryId The system ID for the category on the interaction/step.
             * @returns {String} return.subcategoryId The system ID for the subcategory on the interaction/step.
             * @returns {String} return.location The location of the interaction/step.
             * @returns {String} return.prospectPlanStatusCodeId The system ID for the prospest plan status code.
             * @returns {String} return.planId The system ID for the plan.
             * @returns {frog.utils.prospectUtilities.PlanType} return.planType The plan type.
             * 
             * @returns {Object[]} return.participants
             * @returns {String} return.participants.constituentid The system ID for the participant.
             * @returns {String} return.participants.name The name of the participant.
             * 
             * @returns {Object[]} return.solicitors
             * @returns {String} return.solicitors.constituentId The system ID for the solicitor.
             * @returns {String} return.solicitors.name The name of the solicitor.
             */
            function loadStepAsync(id) {
                svc = bbuiShellService.create();
                return svc.dataFormLoad(StepEditId, {
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
             * 
             * @returns {Promise<Object>} return
             * @returns {Boolean} return.siteRequired Specifies whether or not a site is required for the user.
             * @returns {String} return.siteId The default site for the user.
             */
            function getContactReportPreloadAsync() {
                svc = bbuiShellService.create();
                return svc.dataFormLoad(StepAddId)
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
