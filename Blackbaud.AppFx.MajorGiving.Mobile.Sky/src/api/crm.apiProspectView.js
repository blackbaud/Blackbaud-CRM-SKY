/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    var noop = angular.noop;

    angular.module("frog.frogApi")
    .factory("apiProspectView", ["bbuiShellService", "infinityCache", "infinityUtilities", "frogResources", "bbui", "$q", "prospectUtilities",
        function (bbuiShellService, infinityCache, infinityUtilities, frogResources, bbui, $q, prospectUtilities) {

            var svc;

            function transformPhones(value) {

                value = value || [];

                var phones = [];

                value.forEach(function (phoneDfi) {
                    var phone = {};
                    phoneDfi.forEach(function (dfi) {
                        switch (dfi.name) {
                            case "PHONENUMBER":
                                phone.number = dfi.value;
                                break;
                            case "PHONETYPE":
                                phone.type = dfi.value;
                                break;
                            case "ISCONFIDENTIAL":
                                phone.confidential = dfi.value;
                                break;
                        }
                    });
                    phones.push(phone);
                });

                return phones;

            }

            function transformEmails(value) {

                value = value || [];

                var emails = [];

                value.forEach(function (emailDfi) {
                    var email = {};
                    emailDfi.forEach(function (dfi) {
                        switch (dfi.name) {
                            case "EMAILADDRESS":
                                email.address = dfi.value;
                                break;
                            case "EMAILTYPE":
                                email.type = dfi.value;
                                break;
                        }
                    });
                    emails.push(email);
                });

                return emails;

            }

            /**
             * Get a prospect's basic information.
             *
             * @param {String} prospectId
             * 
             * @param {Object} [options]
             * @param {Boolean} [options.forceReload]
             *
             * @returns {Promise<Object>}
             * @returns {Object} successCallback.prospect
             *
             * @returns {String} returns.prospect.displayName
             * @returns {Boolean} returns.prospect.deceased
             * @returns {Boolean} returns.prospect.inactive
             * @returns {String} returns.prospect.firstName
             * @returns {String} returns.prospect.keyName
             * @returns {Boolean} returns.prospect.hasAddress
             * @returns {String} returns.prospect.pictureThumbnail
             *
             * @returns {Object[]} returns.prospect.phoneNumbers
             * @returns {String} returns.prospect.phoneNumbers.number
             * @returns {String} returns.prospect.phoneNumbers.type
             * @returns {Boolean} returns.prospect.phoneNumbers.confidential
             *
             * @returns {Object[]} returns.prospect.emailAddresses
             * @returns {String} returns.prospect.emailAddresses.address
             * @returns {String} returns.prospect.emailAddresses.type
             *
             * @returns {String} [returns.prospect.jobTitle]
             * @returns {String} [returns.prospect.primaryBusinessId]
             * @returns {String} [returns.prospect.primaryBusinessName]
             *
             * @returns {String} [returns.prospect.spouseId]
             * @returns {String} [returns.prospect.spouseName]
             * @returns {Boolean} [returns.prospect.spouseDeceased]
             *
             * @returns {String} [returns.prospect.nextStepId]
             * @returns {String} [returns.prospect.nextStepContactMethodId]
             * @returns {String} [returns.prospect.nextStepContactMethod]
             * @returns {String} [returns.prospect.nextStepObjective]
             * @returns {String} [returns.prospect.nextStepComments]
             * @returns {String} [returns.prospect.nextStepLocation]
             * @returns {String} [returns.prospect.nextStepDate]
             * Format "yyyy-MM-ddT00:00:00". Time info should be ignored.
             * @returns {String} [returns.prospect.nextStepTime]
             * @returns {String} [returns.prospect.nextStepPlanId]
             * @returns {String} [returns.prospect.nextStepPlanName]
             *
             * @returns {String} [returns.prospect.prospectManagerId]
             * @returns {String} [returns.prospect.prospectManagerName]
             *
             * @returns {String} [returns.prospect.primaryMemberId]
             * @returns {String} [returns.prospect.primaryMemberName]
             *
             *@returns {String} [returns.prospect.prospectFullName]

             */
            function getProspectInfoAsync(prospectId, options) {
                var ProspectViewId = "b0ba1b14-97f7-46d3-b211-ebfa3a783909", // Prospect.Mobile.View.xml
                    cacheKey,
                    cacheResult;

                options = infinityUtilities.cloneOrNew(bbui, options);

                if (!prospectId || typeof prospectId !== "string") {
                    return $q.reject({
                        message: prospectUtilities.ProspectIdRequiredMessage
                    });
                }

                prospectId = prospectId.toUpperCase();

                if (!options.forceReload) {
                    cacheKey = "dataFormLoad-" + ProspectViewId + "-" + prospectId;
                    cacheResult = infinityCache.cache.get(cacheKey);

                    if (cacheResult) {
                        return $q.resolve(cacheResult);
                    }
                }

                svc = bbuiShellService.create();

                return svc.dataFormLoad(
                    ProspectViewId,
                    {
                        recordId: prospectId
                    }
                ).then(function (reply) {
                    var result = {},
                        spouseFirstName,
                        spouseLastName,
                        spouseFullName,
                        primaryMemberFirstName,
                        primaryMemberKeyName,
                        primaryMemberFullName,
                        prospectManagerFirstName,
                        prospectManagerKeyName,
                        prospectManagerFullName;

                    if (reply && reply.data && reply.data.values) {
                        reply.data.values.forEach(function (dfi) {
                            switch (dfi.name) {
                                case "DISPLAYNAME":
                                    result.displayName = dfi.value;
                                    break;
                                case "DECEASED":
                                    result.deceased = dfi.value;
                                    break;
                                case "ISINACTIVE":
                                    result.inactive = dfi.value;
                                    break;
                                case "FIRSTNAME":
                                    result.firstName = dfi.value;
                                    break;
                                case "KEYNAME":
                                    result.keyName = dfi.value;
                                    break;
                                case "HASADDRESS":
                                    result.hasAddress = dfi.value;
                                    break;
                                case "PICTURETHUMBNAIL":
                                    result.pictureThumbnail = dfi.value;
                                    break;
                                case "PHONENUMBERS":
                                    result.phoneNumbers = transformPhones(dfi.value);
                                    break;
                                case "EMAILADDRESSES":
                                    result.emailAddresses = transformEmails(dfi.value);
                                    break;
                                case "JOBTITLE":
                                    result.jobTitle = dfi.value;
                                    break;
                                case "PRIMARYBUSINESSID":
                                    result.primaryBusinessId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "PRIMARYBUSINESSNAME":
                                    result.primaryBusinessName = dfi.value;
                                    break;
                                case "PROSPECTMANAGERFIRSTNAME":
                                    prospectManagerFirstName = dfi.value;
                                    break;
                                case "PROSPECTMANAGERKEYNAME":
                                    prospectManagerKeyName = dfi.value;
                                    break;
                                case "PROSPECTMANAGERID":
                                    result.prospectManagerId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "PRIMARYMEMBERID":
                                    result.primaryMemberId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "PRIMARYMEMBERFIRSTNAME":
                                    primaryMemberFirstName = dfi.value;
                                    break;
                                case "PRIMARYMEMBERKEYNAME":
                                    primaryMemberKeyName = dfi.value;
                                    break;
                                case "SPOUSEID":
                                    result.spouseId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "SPOUSEFIRSTNAME":
                                    spouseFirstName = dfi.value;
                                    break;
                                case "SPOUSELASTNAME":
                                    spouseLastName = dfi.value;
                                    break;
                                case "SPOUSEDECEASED":
                                    result.spouseDeceased = dfi.value;
                                    break;
                                case "NEXTSTEPPLANID":
                                    result.nextStepPlanId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "NEXTSTEPPLANNAME":
                                    result.nextStepPlanName = dfi.value;
                                    break;
                                case "NEXTSTEPCONTACTMETHODID":
                                    result.nextStepContactMethodId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "NEXTSTEPCONTACTMETHOD":
                                    result.nextStepContactMethod = dfi.value;
                                    break;
                                case "NEXTSTEPOBJECTIVE":
                                    result.nextStepObjective = dfi.value;
                                    break;
                                case "NEXTSTEPLOCATION":
                                    result.nextStepLocation = dfi.value;
                                    break;
                                case "NEXTSTEPDATE":
                                    result.nextStepDate = dfi.value;
                                    break;
                                case "NEXTSTEPTIME":
                                    result.nextStepTime = infinityUtilities.convertHourMinute(dfi.value);
                                    break;
                                case "NEXTSTEPID":
                                    result.nextStepId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "NEXTSTEPCOMMENTS":
                                    result.nextStepComments = dfi.value;
                                    break;
                            }
                        });

                        spouseFullName = prospectUtilities.getFullName(frogResources, spouseFirstName, spouseLastName);
                        primaryMemberFullName = prospectUtilities.getFullName(frogResources, primaryMemberFirstName, primaryMemberKeyName);
                        prospectManagerFullName = prospectUtilities.getFullName(frogResources, prospectManagerFirstName, prospectManagerKeyName);
                        result.prospectFullName = prospectUtilities.getFullName(frogResources, result.firstName, result.keyName);

                        if (spouseFullName) {
                            result.spouseName = spouseFullName;
                        }

                        if (primaryMemberFullName) {
                            result.primaryMemberName = primaryMemberFullName;
                        }

                        if (prospectManagerFullName) {
                            result.prospectManagerName = prospectManagerFullName;
                        }

                    }

                    infinityCache.cache.put(cacheKey, bbui.clone(result));
                    return result;
                }, function (reply) {
                    var error = { message: "" };

                    if (reply && reply.data && reply.data.message) {
                        error.message = reply.data.message;
                    }

                    return $q.reject(error);
                });
            }

            /**
             * Get smart field summary information on a prospect.
             *
             * @param {String} prospectId
             * 
             * @returns {Promise<Object>}
             * @returns {Object[]} returns.summaryInformation
             * @returns {String} returns.summaryInformation.smartFieldName
             * @returns {String} returns.summaryInformation.smartFieldValue
             * @returns {String} returns.summaryInformation.currencyId
             * @returns {String} returns.summaryInformation.currencySymbol
             * @returns {String} returns.summaryInformation.decimalSeparator
             * @returns {String} returns.summaryInformation.groupSeparator
             */
            function getProspectSummaryAsync(prospectId, successCallback, failureCallback, finallyCallback) {
                var ProspectSummaryDataListId = "2be9ef80-1880-41ed-9b30-9b953183b43e",
                    cacheKey,
                    cacheResult;

                successCallback = successCallback || noop;
                finallyCallback = finallyCallback || noop;

                if (!prospectId || typeof prospectId !== "string") {

                    if (failureCallback) {
                        failureCallback({
                            message: prospectUtilities.ProspectIdRequiredMessage
                        });

                        finallyCallback();

                        return;
                    }

                    throw new Error(prospectUtilities.ProspectIdRequiredMessage);
                }

                failureCallback = failureCallback || noop;

                prospectId = prospectId.toUpperCase();
                cacheKey = "dataListLoad-" + ProspectSummaryDataListId + "-" + prospectId;
                cacheResult = infinityCache.cache.get(cacheKey);

                if (cacheResult) {
                    successCallback(cacheResult);
                    finallyCallback();
                } else {
                    svc = bbuiShellService.create();

                    svc.dataListLoad(
                        ProspectSummaryDataListId,
                        prospectId
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            info,
                            amount;

                        data = {
                            summaryInformation: []
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            info = reply.data.rows[i].values;
                            amount = (info[1]) ? parseFloat(info[1]) : null;

                            data.summaryInformation.push({
                                smartFieldName: info[0],
                                smartFieldValue: amount,
                                bbAutonumericConfig: {
                                    aSign: info[3],
                                    aDec: info[4],
                                    aSep: info[5],
                                    // This trick determines if you have a whole number,
                                    // and if so, don't include decimal padding.
                                    aPad: amount % 1 !== 0
                                }
                                // TODO: decimal digits and rounding type?
                                // autonumeric doesn't look to support Infinity Currency rounding options
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        successCallback(data);
                    })
                    .catch(function (reply) {
                        prospectUtilities.requestFailure(reply, failureCallback);
                    })
                    .finally(finallyCallback);
                }
            }

            /**
             * Get the recent steps and interactions for a prospect.
             *
             * @param {String} prospectId
             * 
             * @param {Object} [options]
             * @param {Object[]} [options.parameters]
             * @param {String} [options.parameters.id]
             * @param {Object} [options.parameters.value]
             * 
             * @returns {Promise<Object>}
             * @returns {Object[]} returns.steps
             * @returns {String} returns.steps.id
             * @returns {String} returns.steps.contactMethod
             * @returns {String} returns.steps.objective
             * @returns {String} returns.steps.date
             * @returns {String} returns.steps.comments
             * @returns {String} returns.steps.planName
             * @returns {String} returns.steps.planId
             */
            function getRecentStepsAsync(prospectId, options) {
                var RECENTSTEPS_DATALIST_ID = "580e374a-3d5f-4218-9d39-5d2356e04b42";  // RecentSteps.Mobile.DataList.xml

                options = infinityUtilities.cloneOrNew(bbui, options);

                if (!prospectId || typeof prospectId !== "string") {
                    return $q.reject({ message: prospectUtilities.ProspectIdRequiredMessage });
                }

                prospectId = prospectId.toUpperCase();

                svc = bbuiShellService.create();

                return svc.dataListLoad(
                    RECENTSTEPS_DATALIST_ID,
                    prospectId,
                    options
                )
                .then(function (reply) {
                    var data,
                        steps = [];

                    data = {
                        steps: steps
                    };

                    angular.forEach(reply.data.rows, function (row) {
                        var step = row.values;

                        steps.push({
                            id: step[0].toUpperCase(),
                            contactMethod: step[1],
                            objective: step[2],
                            date: step[3],
                            comments: step[4],
                            planName: step[5],
                            planId: infinityUtilities.toUpperIdOrNullIfEmpty(step[6])
                        });
                    });

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
             * Get the recent gifts and credits for a prospect.
             *
             * @param {String} prospectId
             *
             * @param {Function} successCallback
             * @param {Object} successCallback.data
             * @param {Object[]} successCallback.data.gifts
             * @param {String} successCallback.data.gifts.id
             * @param {Number} successCallback.data.gifts.amount
             * @param {String} successCallback.data.gifts.applicationType
             * @param {String} successCallback.data.gifts.date
             * @param {String} successCallback.data.gifts.designation
             * @param {Boolean} successCallback.data.gifts.isRecognitionCredit
             * @param {String} [successCallback.data.gifts.recognitionCreditType]
             * 
             * @param {Object} successCallback.data.gifts.bbAutonumericConfig
             * @param {String} successCallback.data.gifts.bbAutonumericConfig.aSign
             * @param {String} successCallback.data.gifts.bbAutonumericConfig.aDec
             * @param {String} successCallback.data.gifts.bbAutonumericConfig.aSep
             * @param {Boolean} successCallback.data.gifts.bbAutonumericConfig.aPad
             *
             * @param {Function} [failureCallback]
             * @param {String} failureCallback.message
             *
             * @param {Function} [finallyCallback]
             */
            function getRecentGiftsAndCreditsAsync(prospectId, successCallback, failureCallback, finallyCallback) {
                var RecentGiftsAndCreditsDataListId = "85943cb8-8aae-4b27-b71a-31ba13942648",
                    cacheKey,
                    cacheResult;

                successCallback = successCallback || noop;
                finallyCallback = finallyCallback || noop;

                if (!prospectId || typeof prospectId !== "string") {

                    if (failureCallback) {
                        failureCallback({
                            message: prospectUtilities.ProspectIdRequiredMessage
                        });

                        finallyCallback();

                        return;
                    }

                    throw new Error(prospectUtilities.ProspectIdRequiredMessage);

                }

                failureCallback = failureCallback || noop;

                prospectId = prospectId.toUpperCase();
                cacheKey = "dataListLoad-" + RecentGiftsAndCreditsDataListId + "-" + prospectId;
                cacheResult = infinityCache.cache.get(cacheKey);

                if (cacheResult) {
                    successCallback(cacheResult);
                    finallyCallback();
                } else {
                    svc = bbuiShellService.create();

                    svc.dataListLoad(
                        RecentGiftsAndCreditsDataListId,
                        prospectId
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            gift,
                            amount;

                        data = {
                            gifts: []
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            gift = reply.data.rows[i].values;
                            amount = parseFloat(gift[1]);

                            data.gifts.push({
                                id: gift[0].toUpperCase(),
                                amount: amount,
                                applicationType: gift[3],
                                date: gift[4],
                                designation: gift[5],
                                isRecognitionCredit: (gift[6] === "0") ? false : true,
                                recognitionCreditType: gift[7],
                                bbAutonumericConfig: {
                                    aSign: gift[8],
                                    aDec: gift[9],
                                    aSep: gift[10],
                                    // This trick determines if you have a whole number,
                                    // and if so, don't include decimal padding.
                                    aPad: amount % 1 !== 0
                                }
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        successCallback(data);
                    })
                    .catch(function (reply) {
                        prospectUtilities.requestFailure(reply, failureCallback);
                    })
                    .finally(finallyCallback);
                }
            }

            /**
             * Get prospect addresses.
             *
             * @param {String} prospectId
             *
             * @param {Function} successCallback
             * @param {Object} successCallback.data
             * @param {Object[]} successCallback.data.addresses
             * @param {String} successCallback.data.addresses.addressType
             * @param {Boolean} successCallback.data.addresses.isPrimary
             * @param {Boolean} successCallback.data.addresses.isConfidential
             * @param {Boolean} successCallback.data.addresses.doNotMail
             * @param {String} successCallback.data.addresses.description
             *
             * @param {String} successCallback.data.addresses.startDate
             * @param {String} successCallback.data.addresses.endDate
             * @param {Boolean} successCallback.data.addresses.isSeasonal
             *
             * @param {Function} [failureCallback]
             * @param {String} failureCallback.message
             *
             * @param {Function} [finallyCallback]
             *
             */
            function getAddressesListAsync(prospectId, successCallback, failureCallback, finallyCallback) {
                var AddressesDataList = "45fd795a-bfbb-493c-9268-f88c153b66b9",
                    cacheKey,
                    cacheResult;

                successCallback = successCallback || noop;
                finallyCallback = finallyCallback || noop;

                if (!prospectId || typeof prospectId !== "string") {

                    if (failureCallback) {
                        failureCallback({
                            message: prospectUtilities.ProspectIdRequiredMessage
                        });

                        finallyCallback();

                        return;
                    }

                    throw new Error(prospectUtilities.ProspectIdRequiredMessage);

                }

                failureCallback = failureCallback || noop;

                prospectId = prospectId.toUpperCase();
                cacheKey = "dataListLoad-" + AddressesDataList + "-" + prospectId;
                cacheResult = infinityCache.cache.get(cacheKey);

                if (cacheResult) {
                    successCallback(cacheResult);
                    finallyCallback();
                } else {
                    svc = bbuiShellService.create();

                    svc.dataListLoad(
                        AddressesDataList,
                        prospectId
                    )
                    .then(function (reply) {
                        var data,
                            i,
                            n,
                            address;

                        data = {
                            addresses: []
                        };

                        for (i = 0, n = reply.data.rows.length; i < n; i++) {
                            address = reply.data.rows[i].values;

                            data.addresses.push({
                                addressType: (address[0]) ? address[0] : frogResources.unknown,
                                isPrimary: (address[1] === "0") ? false : true,
                                isConfidential: (address[2] === "0") ? false : true,
                                doNotMail: (address[3] === "0") ? false : true,
                                description: address[4],
                                startDate: address[5],
                                endDate: address[6],
                                isSeasonal: (address[7] === "0") ? false : true
                            });
                        }

                        infinityCache.cache.put(cacheKey, bbui.clone(data));
                        successCallback(data);
                    })
                    .catch(function (reply) {
                        prospectUtilities.requestFailure(reply, failureCallback);
                    })
                    .finally(finallyCallback);
                }

            }

            /**
             * Get additional details for a revenue split record.
             *
             * @param {String} lineItemId
             *
             * @returns {Promise<Object>}
             *
             * @returns {String} returns.prospect.currencyId
             * @returns {String} returns.prospect.campaigns
             * @returns {String} returns.prospect.revenueCategory
             * @returns {String} returns.prospect.solicitors
             * @returns {String} returns.prospect.recognitions
             * @returns {String} returns.prospect.opportunity
             * @returns {String} returns.prospect.appliedTo
             * @returns {String} returns.prospect.giftAidStatus
             * @returns {String} returns.prospect.taxClaimEligibility
             * @returns {String} returns.prospect.taxClaimAmount
             */
            function getAdditionalRevenueDetailsAsync(lineItemId) {
                var RevenueDetailsViewId = "aa822383-f32f-4916-95bd-0f4b9a89e4b3", // RevenueDetails.Mobile.View.xml
                    cacheKey,
                    cacheResult;

                if (!lineItemId || typeof lineItemId !== "string") {
                    return $q.reject({
                        message: "lineItemId is required"
                    });
                }

                lineItemId = lineItemId.toUpperCase();

                cacheKey = "dataFormLoad-" + RevenueDetailsViewId + "-" + lineItemId;
                cacheResult = infinityCache.cache.get(cacheKey);

                if (cacheResult) {
                    return $q.resolve(cacheResult);
                }

                svc = bbuiShellService.create();

                return svc.dataFormLoad(
                    RevenueDetailsViewId,
                    {
                        recordId: lineItemId
                    }
                ).then(function (reply) {
                    var result = {};

                    if (reply && reply.data && reply.data.values) {
                        reply.data.values.forEach(function (dfi) {
                            switch (dfi.name) {
                                case "CURRENCYID":
                                    result.currencyId = infinityUtilities.toUpperIdOrNullIfEmpty(dfi.value);
                                    break;
                                case "CAMPAIGNS":
                                    result.campaigns = dfi.value;
                                    break;
                                case "REVENUECATEGORY":
                                    result.revenueCategory = dfi.value;
                                    break;
                                case "SOLICITORSLIST":
                                    result.solicitors = dfi.value;
                                    break;
                                case "RECOGNITIONSLIST":
                                    result.recognitions = dfi.value;
                                    break;
                                case "OPPORTUNITY":
                                    result.opportunity = dfi.value;
                                    break;
                                case "APPLIEDTO":
                                    result.appliedTo = dfi.value;
                                    break;
                                case "GIFTAIDSTATUS":
                                    result.giftAidStatus = dfi.value;
                                    break;
                                case "TAXCLAIMELIGIBILITY":
                                    result.taxClaimEligibility = dfi.value;
                                    break;
                                case "TAXCLAIMAMOUNT":
                                    result.taxClaimAmount = dfi.value;
                                    break;
                            }
                        });
                    }

                    infinityCache.cache.put(cacheKey, bbui.clone(result));
                    return result;
                }, function (reply) {
                    var error = { message: "" };

                    if (reply && reply.data && reply.data.message) {
                        error.message = reply.data.message;
                    }

                    return $q.reject(error);
                });
            }

            return {
                getProspectInfoAsync: getProspectInfoAsync,
                getProspectSummaryAsync: getProspectSummaryAsync,
                getRecentStepsAsync: getRecentStepsAsync,
                getRecentGiftsAndCreditsAsync: getRecentGiftsAndCreditsAsync,
                getAddressesListAsync: getAddressesListAsync,
                getAdditionalRevenueDetailsAsync: getAdditionalRevenueDetailsAsync
            };


        }]);


}());