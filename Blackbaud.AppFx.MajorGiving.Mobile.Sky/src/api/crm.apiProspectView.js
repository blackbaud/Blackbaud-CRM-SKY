/// <reference path="../../bower_components/angular/angular.js" />

/*global angular */

(function () {
    'use strict';

    var noop = angular.noop;

    angular.module("frog.frogApi")
        .factory("apiProspectView", ["bbuiShellService", "infinityCache", "infinityUtilities", "frogResources", "bbui", "$q", "prospectUtilities",
            function (bbuiShellService, infinityCache, infinityUtilities, frogResources, bbui, $q, prospectUtilities) {

                var svc;

                /**
                 * Transforms a collection of phone information to an object that can be used by controllers.
                 * 
                 * @param {Object[]} value
                 * @param {String} value[].name The field ID describing the value.
                 * @param {String} value[].value The value of the field.
                 * 
                 * @returns {Object[]} phones
                 * @returns {String} phones[].number The phone number.
                 * @returns {String} phones[].type The phone type.
                 * @returns {Boolean} phones[].confidential Value indicating whether or not the phone number is confidential.
                 */
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

                /**
                 * Transforms a collection of email information to an object that can be used by controllers.
                 * 
                 * @param {Object[]} value
                 * @param {String} value[].name The field ID describing the value.
                 * @param {String} value[].value The value of the field.
                 * 
                 * @returns {Object[]} emails
                 * @returns {String} emails[].address The email address.
                 * @returns {String} emails[].type The email type.
                 */
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
                 * Get basic demographic information on a given prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 * @param {Object} [options]
                 * @param {Boolean} [options.forceReload] Pull the latest information from the database and ignore the cache.
                 *
                 * @returns {Promise<Object>} return
                 *
                 * @returns {String} return.displayName The prospect's display name.
                 * @returns {Boolean} return.deceased Indicates whether or not prospect is deceased.
                 * @returns {Boolean} return.inactive Indicates whether or not prospect is inactive.
                 * @returns {String} return.firstName The prospect's first name.
                 * @returns {String} return.keyName The prospect's last name.
                 * @returns {Boolean} return.hasAddress Indicates or not prospect has an address.
                 * @returns {String} return.pictureThumbnail The prospect's picture thumbnail.
                 *
                 * @returns {Object[]} return.phoneNumbers A collection of the prospect's phone numbers.
                 * @returns {String} return.phoneNumbers.number The phone number.
                 * @returns {String} return.phoneNumbers.type The phone number type.
                 * @returns {Boolean} return.phoneNumbers.confidential Indicates whether or not the phone number is confidential.
                 *
                 * @returns {Object[]} return.emailAddresses A collection of the prospect's email addresses.
                 * @returns {String} return.emailAddresses.address The email address.
                 * @returns {String} return.emailAddresses.type The email address type.
                 *
                 * @returns {String} return.jobTitle The prospect's job title.
                 * @returns {String} return.primaryBusinessId The system ID of the prospect's primary business.
                 * @returns {String} return.primaryBusinessName The primary business' name.
                 *
                 * @returns {String} return.spouseId The system ID of the prospect's spouse.
                 * @returns {String} return.spouseName The spouse's name.
                 * @returns {Boolean} return.spouseDeceased Indicates whether or not the spouse is deceased.
                 *
                 * @returns {String} return.nextStepId The system ID of the next step for the prospect.
                 * @returns {String} return.nextStepContactMethodId The system ID of the contact method of the next step for the prospect.
                 * @returns {String} return.nextStepContactMethod The contact method of the next step for the prospect.
                 * @returns {String} return.nextStepObjective The objective of the next step for the prospect.
                 * @returns {String} return.nextStepComments The comments on the next step for the prospect.
                 * @returns {String} return.nextStepLocation The location of the next step for the prospect.
                 * @returns {String} return.nextStepDate The date of the next step for the prospect. Format "yyyy-MM-ddT00:00:00". Time info should be ignored.
                 * @returns {String} return.nextStepTime The time of the next step for the prospect.
                 * @returns {String} return.nextStepPlanId The system ID of the prospect plan associated with the next step for the prospect.
                 * @returns {String} return.nextStepPlanName The name of the prospect plan associated with the next step for the prospect.
                 *
                 * @returns {String} return.prospectManagerId The system ID of the prospect manager.
                 * @returns {String} return.prospectManagerName The name of the prospect manager.
                 *
                 * @returns {String} return.primaryMemberId The system ID of the primary group member.
                 * @returns {String} return.primaryMemberName The name of the primary group member.
                 *
                 * @returns {String} return.prospectFullName The prospect's formatted full name.
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
                 * @param {String} prospectId The system ID of the given prospect.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.summaryInformation
                 * @returns {String} return.summaryInformation.smartFieldName The name of the smart field.
                 * @returns {String} return.summaryInformation.smartFieldValue The value of the smart field, formatted based on currency and locale.
                 * @returns {String} return.summaryInformation.currencyId The system ID of the currency.
                 * @returns {String} return.summaryInformation.currencySymbol The currency symbol.
                 * @returns {String} return.summaryInformation.decimalSeparator The decimal separator, based on locale.
                 * @returns {String} return.summaryInformation.groupSeparator The group separator, based on locale.
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
                                            // This trick determines if you have a whole number, and if so, don't include decimal padding.
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
                 * Get the recent steps and interactions for a prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 * 
                 * @param {Object} options
                 * @param {Object[]} options.parameters A collection of parameters.
                 * @param {String} options.parameters.id The FieldId of the parameter to be used to load the data list.
                 * @param {Object} options.parameters.value The value of the parameter.
                 * 
                 * @returns {Promise<Object>} return
                 * @returns {Object[]} return.steps
                 * @returns {String} return.steps.id The system ID for the step or interaction.
                 * @returns {String} return.steps.contactMethod The contact method on the step or interaction.
                 * @returns {String} return.steps.objective The objective of the step or interaction.
                 * @returns {String} return.steps.date The date on the step or interaction.
                 * @returns {String} return.steps.comments The comments on the step or interaction.
                 * @returns {String} return.steps.planName The name of the prospect plan associated with the step or interaction.
                 * @returns {String} return.steps.planId The system ID of the prospect plan associated with the step or interaction.
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
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.data
                 * @returns {Object[]} return.data.gifts
                 * @returns {String} return.data.gifts.id The system ID of the gift.
                 * @returns {Number} return.data.gifts.amount The gift amount, formatted by currency and locale.
                 * @returns {String} return.data.gifts.applicationType The application type of the gift.
                 * @returns {String} return.data.gifts.date The transaction date of the gift.
                 * @returns {String} return.data.gifts.designation The designation associated with the gift.
                 * @returns {Boolean} return.data.gifts.isRecognitionCredit Indicates whether or not the gift is a recognition credit.
                 * @returns {String} return.data.gifts.recognitionCreditType The recognition credit type.
                 * 
                 * @returns {Object} return.data.gifts.bbAutonumericConfig
                 * @returns {String} return.data.gifts.bbAutonumericConfig.aSign The currency symbol.
                 * @returns {String} return.data.gifts.bbAutonumericConfig.aDec The decimal separator, determined by locale.
                 * @returns {String} return.data.gifts.bbAutonumericConfig.aSep The group separator, determined by locale.
                 * @returns {Boolean} return.data.gifts.bbAutonumericConfig.aPad Indicates whether to pad for decimal values.
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
                                            // This trick determines if you have a whole number, and if so, don't include decimal padding.
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
                 * Get a list of addresses for the given prospect.
                 *
                 * @param {String} prospectId The system ID of the given prospect.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {Object} return.data
                 * @returns {Object[]} return.data.addresses
                 * @returns {String} return.data.addresses.addressType The type of the address.
                 * @returns {Boolean} return.data.addresses.isPrimary Indicates whether the address is primary.
                 * @returns {Boolean} return.data.addresses.isConfidential Indicates whether the address is confidential.
                 * @returns {Boolean} return.data.addresses.doNotMail Indicates whether the address is marked as do not mail.
                 * @returns {String} return.data.addresses.description The description of the address.
                 * @returns {String} return.data.addresses.startDate The start date of the address.
                 * @returns {String} return.data.addresses.endDate The end date of the address.
                 * @returns {Boolean} return.data.addresses.isSeasonal Indicates whether the address is seasonal.
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
                 * Get additional details for a given financial transaction line item.
                 *
                 * @param {String} lineItemId The system ID of the given line item.
                 *
                 * @returns {Promise<Object>} return
                 * @returns {String} return.currencyId The system ID of the associated currency.
                 * @returns {String} return.campaigns A list of associated campaigns.
                 * @returns {String} return.revenueCategory The associated revenue category.
                 * @returns {String} return.solicitors A list of associated solicitors.
                 * @returns {String} return.recognitions A list of revenue recognitions.
                 * @returns {String} return.opportunity The associated opportunity.
                 * @returns {String} return.appliedTo The application to which the line item is applied.
                 * @returns {String} return.giftAidStatus The gift aid status of the line item. (UK)
                 * @returns {String} return.taxClaimEligibility The tax claim eligibility of the line item. (UK)
                 * @returns {String} return.taxClaimAmount The tax claim amount of the line item. (UK)
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