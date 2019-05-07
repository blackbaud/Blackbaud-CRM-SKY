/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';


    angular.module("frog.frogApi")

    .factory("apiContactReportOptions", ["bbuiShellService", "infinityCache", "bbui", "prospectUtilities", "$q", "frogResources", "infinityUtilities",
            function (bbuiShellService, infinityCache, bbui, prospectUtilities, $q, frogResources, infinityUtilities) {

                var svc,
                    CONTACTMETHOD_SIMPLELIST_ID = "a89a4f2b-76f2-43fa-8abc-ae0e84d2d64e", // ContactMethods.Mobile.SimpleList.xml
                    INTERACTIONCATEGORIES_SIMPLELIST_ID = "CBBA7545-B66F-44AC-AA24-D9C2F8CBC4EC", // InteractionCategory.SimpleList.xml
                    SUBCATEGORIES_SIMPLELIST_ID = "0EACC39B-07D1-4641-8774-E319559535A7", // InteractionSubcategory.SimpleList.xml
                    POTENTIALSOLICITORS_SIMPLELIST_ID = "8A1DE7E9-57B4-400F-ABAB-1F0F7B96B02D", // ProspectPlanFundraisers.Mobile.SimpleList.xml
                    SITES_SIMPLELIST_ID = "C8E8D3BA-2725-421f-A796-E2FCC1202780"; // SitesForUser.SimpleList.xml

                /**
                 * Get the possible contact method options.
                 * 
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId]
                 * The feature ID providing implied security for the contact method simple data list.
                 * @param {String} [options.securityContextFeatureType]
                 * The feature type of the feature providing implied security of the contact method simple data list.
                 * 
                 * @returns {Promise<Object>}
                 * @returns {Array} return.contactMethods
                 * @returns {String} return.contactMethods.id
                 * @returns {String} return.contactMethods.name
                 */
                function getContactMethodsAsync(options) {
                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + CONTACTMETHOD_SIMPLELIST_ID;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        CONTACTMETHOD_SIMPLELIST_ID,
                        options
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            contactMethod,
                            contactMethods = [];

                        data = {
                            contactMethods: contactMethods
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            contactMethod = reply.data.rows[i];

                            contactMethods.push({
                                id: contactMethod.value.toUpperCase(),
                                name: contactMethod.label
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        return data;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get the possible plan stage options.
                 *
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId]
                 * The feature ID providing implied security for the prospect plan stages simple data list.
                 * @param {String} [options.securityContextFeatureType]
                 * The feature type of the feature providing implied security of the prospect plan stages simple data list.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.planStages
                 * @returns {String} return.planStages.id
                 * @returns {String} return.planStages.name
                 */
                function getPlanStagesAsync(options) {
                    var cacheKey,
                        cacheResult,
                        ProspectPlanStagesSimpleDataListId = "48182a32-39ee-454e-87e8-ac6ae255c259";

                    cacheKey = "simpleDataListLoad-" + ProspectPlanStagesSimpleDataListId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        ProspectPlanStagesSimpleDataListId,
                        options
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            planStage,
                            planStages = [];

                        data = {
                            planStages: planStages
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            planStage = reply.data.rows[i];

                            planStages.push({
                                id: planStage.value.toUpperCase(),
                                name: planStage.label
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        return data;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get the possible category options.
                 *
                 * @param {frog.util.prospectUtilities.PlanType} planType
                 *
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId]
                 * The feature ID providing implied security for the interaction categories simple data list.
                 * @param {String} [options.securityContextFeatureType]
                 * The feature type of the feature providing implied security of the interaction categories simple data list.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.categories
                 * @returns {String} return.categories.id
                 * @returns {String} return.categories.name
                 */
                function getCategoriesAsync(planType, options) {
                    var cacheKey,
                        cacheResult,
                        CodeTableEntryMobileSimpleDataListId = "4BC0FBBF-F1FD-465D-9B40-FCD3B4E5A335",
                        StewardshipStepCategoryCode = "STEWARDSHIPSTEPCATEGORYCODE",
                        simpleListId;

                    if (planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP) {
                        simpleListId = CodeTableEntryMobileSimpleDataListId;
                        cacheKey = "simpleDataListLoad-" + CodeTableEntryMobileSimpleDataListId + "-" + StewardshipStepCategoryCode;
                        options = infinityUtilities.cloneOrNew(bbui, options);

                        angular.extend(options, {
                            parameters: [{
                                id: "CODETABLENAME",
                                value: StewardshipStepCategoryCode
                            }]
                        });

                    } else {
                        simpleListId = INTERACTIONCATEGORIES_SIMPLELIST_ID;
                        // Prospect plan steps and interactions have the same categories.
                        cacheKey = "simpleDataListLoad-" + INTERACTIONCATEGORIES_SIMPLELIST_ID;
                    }

                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(simpleListId, options)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                category,
                                categories = [];

                            data = {
                                categories: categories
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                category = reply.data.rows[i];

                                categories.push({
                                    id: category.value.toUpperCase(),
                                    name: category.label
                                });
                            }

                            infinityCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get the possible location options.
                 *
                 * @param {String} prospectId
                 *
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId]
                 * The feature ID providing implied security for the address simple data list.
                 * @param {String} [options.securityContextFeatureType]
                 * The feature type of the feature providing implied security of the address simple data list.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.locations
                 * @returns {String} return.locations.id
                 * @returns {String} return.locations.name
                 */
                function getLocationsAsync(prospectId, options) {
                    var cacheKey,
                        cacheResult,
                        LocationSimpleDataListId = "b0cb4058-4355-431a-abdb-3e9f2be8c918";

                    cacheKey = "simpleDataListLoad-" + LocationSimpleDataListId + "-" + prospectId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = infinityUtilities.cloneOrNew(bbui, options);
                    angular.extend(options, {
                        parameters: [
                            {
                                name: "CONSTITUENTID",
                                value: prospectId
                            }
                        ]
                    });

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(LocationSimpleDataListId, options)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                location,
                                locations = [];

                            data = {
                                locations: locations
                            };

                            // Fetch existing addresses from database
                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                location = reply.data.rows[i];

                                locations.push({
                                    id: location.value.toUpperCase(),
                                    name: location.label
                                });
                            }

                            // Add "other" option using its well-known GUID
                            locations.push({
                                id: "84A394FE-55B8-4737-9B2F-CC478766EC39",
                                name: frogResources.other
                            });

                            infinityCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get the possible subcategory options.
                 *
                 * @param {String} categoryId
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId]
                 * The feature ID providing implied security for the interaction subcategories simple data list.
                 * @param {String} [options.securityContextFeatureType]
                 * The feature type of the feature providing implied security of the interaction subcategories simple data list.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.subcategories
                 * @returns {String} return.subcategories.id
                 * @returns {String} return.subcategories.name
                 */
                function getSubcategoriesAsync(categoryId, options) {
                    if (!categoryId || typeof categoryId !== "string") {
                        return $q.reject({ message: "categoryId is required" });
                    }

                    categoryId = categoryId.toUpperCase();

                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + SUBCATEGORIES_SIMPLELIST_ID + "-" + categoryId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = infinityUtilities.cloneOrNew(bbui, options);
                    angular.extend(options, {
                        parameters: [
                            {
                                name: "INTERACTIONCATEGORYID",
                                value: categoryId
                            }
                        ]
                    });

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        SUBCATEGORIES_SIMPLELIST_ID,
                        options
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            subcategory,
                            subcategories = [];

                        data = {
                            subcategories: subcategories
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            subcategory = reply.data.rows[i];

                            subcategories.push({
                                id: subcategory.value.toUpperCase(),
                                name: subcategory.label
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        return data;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get potential step participants for a prospect.
                 *
                 * @param {String} prospectId
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.potentialParticipants
                 * @returns {String} return.potentialParticipants.id
                 * @returns {String} return.potentialParticipants.name
                 */
                function getPotentialParticipantsAsync(prospectId) {
                    var InteractionParticipantCandidatesMobileDataListId = "21c66a32-5acd-4329-aa8e-9e3b0f6d2e9b",
                        cacheKey,
                        cacheResult;

                    if (!prospectId || typeof prospectId !== "string") {
                        return $q.reject({ message: prospectUtilities.ProspectIdRequiredMessage });
                    }

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + InteractionParticipantCandidatesMobileDataListId + "-" + prospectId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        InteractionParticipantCandidatesMobileDataListId,
                        prospectId
                    )
                    .then(function (reply) {
                        var Id = 0,
                            FirstName = 1,
                            KeyName = 2,
                            data,
                            participants = [];

                        data = {
                            potentialParticipants: participants
                        };

                        reply.data.rows.forEach(function (participant) {
                            var participantValues = participant.values;

                            participants.push({
                                id: participantValues[Id].toUpperCase(),
                                name: prospectUtilities.getFullName(frogResources, participantValues[FirstName], participantValues[KeyName])
                            });
                        });

                        infinityCache.cache.put(cacheKey, bbui.clone(data));

                        return data;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get potential step additional solicitors for a prospect.
                 *
                 * @param {String} planId
                 *
                 * @param {Object} [options]
                 * @param {String} [options.securityContextFeatureId]
                 * The feature ID providing implied security for the potential solicitors simple data list.
                 * @param {String} [options.securityContextFeatureType]
                 * The feature type of the feature providing implied security of the potential solicitors simple data list.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.potentialSolicitors
                 * @returns {String} return.potentialSolicitors.id
                 * @returns {String} return.potentialSolicitors.name
                 */
                function getPotentialSolicitorsAsync(planId, options) {

                    if (!planId || typeof planId !== "string") {
                        return $q.reject({ message: "planId is required" });
                    }

                    planId = planId.toUpperCase();

                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + POTENTIALSOLICITORS_SIMPLELIST_ID + "-" + planId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    options = infinityUtilities.cloneOrNew(bbui, options);
                    angular.extend(options, {
                        parameters: [
                            {
                                name: "PROSPECTPLANID",
                                value: planId
                            }
                        ]
                    });

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(
                        POTENTIALSOLICITORS_SIMPLELIST_ID,
                        options
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            solicitor,
                            solicitors = [];

                        data = {
                            potentialSolicitors: solicitors
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            solicitor = reply.data.rows[i];

                            solicitors.push({
                                id: solicitor.value.toUpperCase(),
                                name: solicitor.label
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        return data;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get the possible sites.
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.sites
                 * @returns {String} return.sites.id
                 * @returns {String} return.sites.name 
                 */
                function getSitesAsync() {
                    var cacheKey,
                        cacheResult;

                    cacheKey = "simpleDataListLoad-" + SITES_SIMPLELIST_ID;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.simpleDataListLoad(SITES_SIMPLELIST_ID)
                        .then(function (reply) {
                            var data,
                                i,
                                n,
                                site,
                                sites = [];

                            data = {
                                sites: sites
                            };

                            for (i = 0, n = reply.data.rows.length; i < n; i++) {
                                site = reply.data.rows[i];
                                sites.push({
                                    id: site.value.toUpperCase(),
                                    name: site.label
                                });
                            }

                            infinityCache.cache.put(cacheKey, bbui.clone(data));
                            return data;
                        }, function (reply) {
                            var error = { message: "" };

                            if (reply && reply.data && reply.data.message) {
                                error.message = reply.data.message;
                            }

                            return $q.reject(error);
                        });
                }

                /**
                 * Get plans for a prospect.
                 *
                 * @param {String} prospectId
                 *
                 * @returns {Promise<Object>}
                 * @returns {Array} return.plans
                 * @returns {String} return.plans.id
                 * @returns {String} return.plans.name
                 * @returns {String} return.plans.planType
                 */
                function getPlansAsync(prospectId) {
                    var ProspectPlansMobileDataListId = "2696ec4c-34df-4922-b0ac-4b57acc14e28",
                        cacheKey,
                        cacheResult;

                    if (!prospectId || typeof prospectId !== "string") {
                        return $q.reject({
                            message: prospectUtilities.ProspectIdRequiredMessage
                        });
                    }

                    prospectId = prospectId.toUpperCase();
                    cacheKey = "dataListLoad-" + ProspectPlansMobileDataListId + "-" + prospectId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }

                    svc = bbuiShellService.create();

                    return svc.dataListLoad(
                        ProspectPlansMobileDataListId,
                        prospectId
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            plan,
                            plans = [];

                        data = {
                            plans: plans
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            plan = reply.data.rows[i].values;

                            plans.push({
                                id: plan[0].toUpperCase(),
                                name: plan[1],
                                planType: parseInt(plan[2]) + 1
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        return data;
                    }, function (reply) {
                        var error = { message: "" };

                        if (reply && reply.data && reply.data.message) {
                            error.message = reply.data.message;
                        }

                        return $q.reject(error);
                    });
                }

                /**
                 * Get the status codes available for steps.
                 *
                 * This is purposefully hard-coded and we do not need to get this information from CRM.
                 * This is a ValueList in the spec.
                 *
                 * Making this async so that if there are other products that use this in the future,
                 * if they need to grab the possible status codes from their back end, that is simple to do.
                 *
                 * @param {frog.util.prospectUtilities.PlanType} planType
                 *
                 * @returns {Promise<Object[]>}
                 * @returns {String} return.value
                 * @returns {String} return.label
                 */
                function getStatusCodesAsync(planType) {
                    var statusCodes = [
                        {
                            value: 1,
                            label: frogResources.pending
                        },
                        {
                            value: 2,
                            label: frogResources.completed
                        }
                    ];

                    switch (planType) {
                        case prospectUtilities.PLAN_TYPE.PROSPECT:
                            // Insert the status at the beginning.
                            statusCodes.unshift({
                                value: 0,
                                label: frogResources.planned
                            });
                            break;
                        case prospectUtilities.PLAN_TYPE.STEWARDSHIP:
                            statusCodes = [
                                {
                                    value: 0,
                                    label: frogResources.pending
                                },
                                {
                                    value: 1,
                                    label: frogResources.completed
                                }
                            ];
                            break;
                    }

                    return $q.resolve({
                        statusCodes: statusCodes
                    });
                }

                function getCompletedStatusCode(planType) {
                    if (planType === prospectUtilities.PLAN_TYPE.STEWARDSHIP) {
                        return 1;
                    } else {
                        return 2;
                    }
                }

                return {
                    getContactMethodsAsync: getContactMethodsAsync,
                    getPlanStagesAsync: getPlanStagesAsync,
                    getCategoriesAsync: getCategoriesAsync,
                    getSubcategoriesAsync: getSubcategoriesAsync,
                    getLocationsAsync: getLocationsAsync,
                    getPotentialParticipantsAsync: getPotentialParticipantsAsync,
                    getPotentialSolicitorsAsync: getPotentialSolicitorsAsync,
                    getSitesAsync: getSitesAsync,
                    getPlansAsync: getPlansAsync,
                    getStatusCodesAsync: getStatusCodesAsync,
                    getCompletedStatusCode: getCompletedStatusCode
                };

            }]);

}());
